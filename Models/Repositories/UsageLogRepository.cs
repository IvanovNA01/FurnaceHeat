using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Data.SqlClient;
using System.Threading.Tasks;
using FurnaceHeat.Models.DTOs;
using Microsoft.Extensions.Configuration;

namespace FurnaceHeat.Models.Repositories
{
	public class UsageLogRepository : IUsageLogRepository
	{
		private readonly string conString;
		public UsageLogRepository(IConfiguration config) => conString = config.GetConnectionString("Domna4");



		public async Task<IEnumerable<string>> GetIps()
		{
			string stmt = @"SELECT DISTINCT Ip FROM UsageLogs";
			IList<string> result = new List<string>();

			await using (SqlConnection db = new SqlConnection(conString))
			await using (DbCommand cmd = new SqlCommand(stmt, db))
			{
				await db.OpenAsync();

				await using (DbDataReader reader = await cmd.ExecuteReaderAsync())
				{
					while (await reader.ReadAsync())
						result.Add(reader["Ip"].ToString());
				}

				return result;
			}
		}
		public async Task<int> Put(UsageLog[] obj)
		{
			string stmt = @"INSERT UsageLogs (UsageDate, Ip, Method, Params)
           VALUES (@date, @ip, @method, @params)";

			await using (SqlConnection db = new SqlConnection(conString))
			await using (SqlCommand cmd = new SqlCommand(stmt, db))
			{
				cmd.Parameters.AddWithValue("@date", obj[0].Date.ToString("yyyy-MM-dd HH:mm:ss"));
				cmd.Parameters.AddWithValue("@ip", obj[0].Ip);
				cmd.Parameters.AddWithValue("@method", obj[0].Method);
				cmd.Parameters.AddWithValue("@params", obj[0].Params.Substring(1));

				await db.OpenAsync();
				return await cmd.ExecuteNonQueryAsync();
			}
		}
		public async Task<IEnumerable<UsageLog>> GetFor(string what)
		{
			await using (SqlConnection db = new SqlConnection(conString))
			await using (SqlCommand cmd = new SqlCommand())
			{
				cmd.Connection = db;

				if (DateTime.TryParse(what, out DateTime date))
				{
					cmd.CommandText = "SELECT * FROM UsageLogs WHERE FORMAT(UsageDate, 'yyyy-MM-dd') = FORMAT(@date, 'yyyy-MM-dd')";
					cmd.Parameters.AddWithValue("@date", date);
				}
				else
				{
					cmd.CommandText = "SELECT * FROM UsageLogs WHERE Ip = @ip";
					cmd.Parameters.AddWithValue("@ip", what);
				}

				return await assembleUsageLog(db, cmd);
			}
		}
		public async Task<IEnumerable<UsageLog>> GetForAll(string date, string ip)
		{
			string stmt = "SELECT * FROM UsageLogs WHERE Ip = @ip AND CAST(UsageDate AS date) = CAST(@date AS date)";

			await using (SqlConnection db = new SqlConnection(conString))
			await using (SqlCommand cmd = new SqlCommand(stmt, db))
			{
				cmd.Parameters.AddWithValue("@date", date);
				cmd.Parameters.AddWithValue("@ip", ip);

				return await assembleUsageLog(db, cmd);
			}
		}



		///////////////////// PRIVATE SECTION
		private async Task<IList<UsageLog>> assembleUsageLog(DbConnection db, DbCommand cmd)
		{
			IList<UsageLog> result = new List<UsageLog>();

			await db.OpenAsync();

			await using (DbDataReader reader = await cmd.ExecuteReaderAsync())
				while (await reader.ReadAsync())
					result.Add(new UsageLog
					{
						Date = Convert.ToDateTime(reader["UsageDate"]),
						Ip = reader["Ip"].ToString(),
						Method = reader["Method"].ToString(),
						Params = reader["Params"].ToString()
					});

			return result;
		}
	}
}