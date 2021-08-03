using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Data.SqlClient;
using System.Globalization;
using System.Threading.Tasks;
using FurnaceHeat.Models.DTOs;
using Microsoft.Extensions.Configuration;

namespace FurnaceHeat.Models.Repositories
{
	public class HistoryRepository : IHistoryRepository
	{
		protected string conString;

		public HistoryRepository(IConfiguration config) => conString = config.GetConnectionString("Domna4");


		public Task<IEnumerable<T1150History>> GetFor(string what) => throw new NotImplementedException();



		public async Task<Dictionary<string, List<T1150History>>> GetFor(string bDate, string eDate, int poyas)
		{
			var result = new Dictionary<string, List<T1150History>>();

			string stmt = @"SELECT 
												CONVERT(varchar, [Date], 23) AS [Date]
												,Poyas
												,Luch
												,R1150
											FROM T1150History
											WHERE [Date] BETWEEN @bDate AND @eDate
												AND Poyas=@poyas
											ORDER BY Luch";

			await using (SqlConnection db = new SqlConnection(conString))
			await using (SqlCommand cmd = new SqlCommand(stmt, db))
			{
				cmd.Parameters.AddWithValue("@bDate", bDate);
				cmd.Parameters.AddWithValue("@eDate", eDate);
				cmd.Parameters.AddWithValue("@poyas", poyas);

				await db.OpenAsync();
				await using (DbDataReader reader = await cmd.ExecuteReaderAsync())
				{
					while (await reader.ReadAsync())
					{
						var currentHistory = new T1150History
						{
							Date = Convert.ToDateTime(reader[0]),
							Poyas = Convert.ToInt32(reader[1]),
							Luch = Convert.ToInt32(reader[2]),
							R1150 = Convert.ToDouble(reader[3]),
						};

						var currentDate = currentHistory.Date.ToString("yyyy-MM-dd");
						if (result.ContainsKey(currentDate))
							result[currentDate].Add(currentHistory);
						else
							result.Add(currentDate, new List<T1150History>() { currentHistory });

						if (result[currentDate].Count > 32)
							throw new Exception($"Данных больше чем на 32 луча за {currentDate}");
					}
				}
			}

			return result;
		}
		public async Task<int> Put(T1150History[] obj)
		{
			string stmt = "INSERT T1150History (Date, Poyas, Luch, R1150) VALUES ";
			string objDate = obj[0].Date.ToString("yyyy-MM-dd");

			string check = string.Format(@"SELECT COUNT(*)
                   FROM T1150History
                   WHERE
                    CAST([Date] as date) = CAST('{0}' as date)
                    AND Poyas = {1}", objDate, obj[0].Poyas);

			await using (SqlConnection db = new SqlConnection(conString))
			await using (SqlCommand cmd = new SqlCommand(check, db))
			{
				await db.OpenAsync();

				// append only if it isn't in the database yet
				if ((int)(await cmd.ExecuteScalarAsync()) == 0)
				{
					foreach (T1150History one in obj)
					{
						stmt += $"('{one.Date.ToString("yyyy-MM-dd")}',{one.Poyas},{one.Luch},{one.R1150.ToString(CultureInfo.InvariantCulture)}),";
					}
					stmt = stmt.Remove(stmt.Length - 1);
					cmd.CommandText = stmt;

					return await cmd.ExecuteNonQueryAsync();
				}

				throw new Exception($"The db already contains data for '{objDate}'");
			}
		}
	}
}