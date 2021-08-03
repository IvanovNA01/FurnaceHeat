using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Data.SqlClient;
using System.Threading.Tasks;
using FurnaceHeat.Models.DTOs;
using Microsoft.Extensions.Configuration;


namespace FurnaceHeat.Models.Repositories
{
	public class HeatRepository : IHeatRepository
	{
		protected string conString;
		private Dictionary<string, DbCommand> cmdPool = new Dictionary<string, DbCommand>();


		public HeatRepository(IConfiguration config) => conString = config.GetConnectionString("Domna4");



		public Task<int> Put(Sensor[] obj) => throw new NotImplementedException();



		public async Task<Dictionary<string, List<Sensor>>> Instant()
		{
			string stmt = @"SELECT
												o.TagComment [name],
												m.VarValue val,
												sh.VarValue prevVal
											FROM ShortHistory sh
												JOIN Settings_OPCTagsList o
												ON o.TagName LIKE '%T_Futerovki%'
													AND o.Tag_ID=sh.TagId
													AND sh.HH=DATEPART(HOUR, GETDATE())-1
													AND DATEPART(MINUTE, sh.[DateTime])=0
													AND FORMAT(sh.[DateTime], 'yyyy-MM-dd') = FORMAT(GETDATE(), 'yyyy-MM-dd')
												JOIN Minuta m
												ON m.VarName LIKE '%T_Futerovki%'
													AND m.VarName=o.TagName
											ORDER BY o.TagComment";

			var result = new Dictionary<string, List<Sensor>>();

			await using (SqlConnection db = new SqlConnection(conString))
			await using (DbCommand cmd = new SqlCommand(stmt, db))
			{
				await db.OpenAsync();

				await using (DbDataReader reader = await cmd.ExecuteReaderAsync())
				{
					while (await reader.ReadAsync())
					{
						var nowSensor = new Sensor { Name = reader[0].ToString(), Value = Convert.ToDouble(reader[1]) };
						var lastHourSensor = new Sensor { Name = reader[0].ToString(), Value = Convert.ToDouble(reader[2]) };

						if (result.ContainsKey("now"))
							result["now"].Add(nowSensor);
						else
							result.Add("now", new List<Sensor>() { nowSensor });


						if (result.ContainsKey("now1hour"))
							result["now1hour"].Add(lastHourSensor);
						else
							result.Add("now1hour", new List<Sensor>() { lastHourSensor });
					}
				}
			}

			return result;
		}
		public async Task<IEnumerable<Sensor>> GetFor(string dt)
		{
			string tableName = "LongHistory";

			if (dt == DateTime.Today.ToString("yyyy-MM-dd"))
				tableName = "ShortHistory";

			string stmt = string.Format(@"SELECT
																			o.TagComment [name],
																			AVG(h.VarValue) val
																		FROM {0} h
																		JOIN Settings_OPCTagsList o
																			ON h.TagId=o.Tag_ID
																				AND o.TagName like '%T_Futerovki%'
																				AND h.[DateTime] = @date
																		GROUP BY o.TagComment
																		ORDER BY o.TagComment", tableName);

			await using (SqlConnection db = new SqlConnection(conString))
			await using (SqlCommand cmd = new SqlCommand(stmt, db))
			{
				cmd.Parameters.AddWithValue("@date", dt);
				return await this.assembleResponse(db, cmd);
			}

		}
		public async Task<Dictionary<string, List<Sensor>>> GetFor(string bDate, string eDate)
		{
			string tableName = "LongHistory";

			if (eDate == DateTime.Today.ToString("yyyy-MM-dd"))
				tableName = "ShortHistory";

			string stmt = String.Format(@"WITH interval AS (
																			SELECT
																				o.TagComment [name],
																				h.VarValue val,
																				CONVERT(varchar, h.[DateTime], 23)  [date]
																			FROM {0} h
																				JOIN Settings_OPCTagsList o
																				ON h.TagId=o.Tag_ID
																					AND o.TagName LIKE '%T_Futerovki%'
																					AND h.[DateTime] BETWEEN @bDate AND @eDate
																		)
																		SELECT
																			[name],
																			AVG(val) val,
																			[date]
																		FROM interval
																		GROUP BY [name], [date]
																		ORDER BY [date], [name]", tableName);

			await using (SqlConnection db = new SqlConnection(conString))
			await using (SqlCommand cmd = new SqlCommand(stmt, db))
			{
				cmd.Parameters.AddWithValue("@bDate", bDate);
				cmd.Parameters.AddWithValue("@eDate", eDate);

				return await this.AssembleInterval(db, cmd);
			}
		}
		public async Task<Dictionary<string, List<Sensor>>> GetIntervalFor(string bDate, string eDate, int poyas)
		{
			string stmt = @"WITH interval AS (
												SELECT
													o.TagComment [name],
													h.VarValue val,
													FORMAT(h.[DateTime], 'yyyy-MM-dd')  [date]
												FROM LongHistory h
													JOIN Settings_OPCTagsList o
													ON h.TagId=o.Tag_ID
														AND o.TagName LIKE '%T_Futerovki%'
														AND o.TagComment LIKE '%пояс '+@poyas+',%'
														AND h.[DateTime] BETWEEN @bDate AND @eDate
											)
											SELECT
												[name],
												AVG(val) val,
												[date]
											FROM interval
											GROUP BY [name], [date]
											ORDER BY [date], [name]";

			await using (SqlConnection db = new SqlConnection(conString))
			await using (SqlCommand cmd = new SqlCommand(stmt, db))
			{
				cmd.Parameters.AddWithValue("@bDate", bDate);
				cmd.Parameters.AddWithValue("@eDate", eDate);
				cmd.Parameters.AddWithValue("@poyas", poyas.ToString());
				cmd.CommandTimeout = 60;

				var result = await this.AssembleInterval(db, cmd);
				return result;
			}
		}





		//////////////////////////////////////////////////////////////////// PRIVATE SECTION
		private async Task<List<Sensor>> assembleResponse(DbConnection db, DbCommand cmd)
		{
			var sensorList = new List<Sensor>();

			await db.OpenAsync();
			await using (DbDataReader reader = await cmd.ExecuteReaderAsync())
			{
				while (await reader.ReadAsync())
					sensorList.Add(new Sensor
					{
						Name = reader[0].ToString(),
						Value = Convert.ToDouble(reader[1])
					});
			}

			return sensorList;
		}
		private async Task<Dictionary<string, List<Sensor>>> AssembleInterval(DbConnection db, DbCommand cmd)
		{
			var result = new Dictionary<string, List<Sensor>>();

			await db.OpenAsync();
			await using (DbDataReader reader = await cmd.ExecuteReaderAsync())
			{
				while (await reader.ReadAsync())
				{
					Sensor sensor = new Sensor { Name = reader[0].ToString(), Value = Convert.ToDouble(reader[1]) };

					string date = reader[2].ToString();
					if (result.ContainsKey(date))
						result[date].Add(sensor);
					else
						result.Add(date, new List<Sensor>() { sensor });
				}
			}

			return result;
		}
	}
}