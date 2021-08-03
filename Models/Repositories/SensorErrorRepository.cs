using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Data.SqlClient;
using System.Globalization;
using System.Threading.Tasks;
using FurnaceHeat.Models.DTOs;
using Microsoft.Extensions.Configuration;

namespace FurnaceHeat.Models.Repositories
{
	public class SensorErrorRepository : ISensorErrorRepository
	{
		protected readonly string conString;

		public SensorErrorRepository(IConfiguration config) => conString = config.GetConnectionString("Domna4");


		public Task<IEnumerable<SensorError>> GetFor(string what) => throw new NotImplementedException();



		public async Task<IEnumerable<SensorError>> GetErrors()
		{
			IList<SensorError> result = new List<SensorError>();

			string stmt = "SELECT * FROM SensorErrors";

			await using (SqlConnection db = new SqlConnection(conString))
			await using (SqlCommand cmd = new SqlCommand(stmt, db))
			{
				await db.OpenAsync();

				await using (DbDataReader reader = await cmd.ExecuteReaderAsync())
					while (await reader.ReadAsync())
					{
						var currentError = new SensorError
						{
							Date = Convert.ToDateTime(reader[0]),
							Poyas = Convert.ToInt32(reader[1]),
							Luch = Convert.ToInt32(reader[2]),
							Radius = Convert.ToInt32(reader[3]),
							Value = Convert.ToDouble(reader[4]),
						};

						result.Add(currentError);
					}
			}

			return result;
		}
		public async Task<int> Put(SensorError[] obj)
		{
			string stmt = "INSERT SensorErrors (Date, Poyas, Luch, Radius, Value) values ";

			foreach (SensorError one in obj)
				stmt += $"('{one.Date.ToLocalTime().ToString("s")}',{one.Poyas},{one.Luch},{one.Radius},{one.Value.ToString(CultureInfo.InvariantCulture)}),";

			stmt = stmt.Remove(stmt.Length - 1);

			await using (SqlConnection db = new SqlConnection(conString))
			await using (SqlCommand cmd = new SqlCommand(stmt, db))
			{
				await db.OpenAsync();
				return await cmd.ExecuteNonQueryAsync();
			}
		}
	}
}