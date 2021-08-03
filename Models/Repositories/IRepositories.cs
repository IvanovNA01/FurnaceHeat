using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FurnaceHeat.Models.DTOs;

namespace FurnaceHeat.Models.Repositories
{
	public interface IRepository<T> where T : class
	{
		Task<int> Put(T[] obj);
		Task<IEnumerable<T>> GetFor(string what);
	}


	/////////////////// HEAT
	public interface IHeatRepository : IRepository<Sensor>
	{
		Task<Dictionary<string, List<Sensor>>> Instant();
		Task<Dictionary<string, List<Sensor>>> GetFor(string dt, string dt2);
		Task<Dictionary<string, List<Sensor>>> GetIntervalFor(string bDate, string eDate, int poyas);
	}


	/////////////////// HISTORY
	public interface IHistoryRepository : IRepository<T1150History>
	{
		Task<Dictionary<string, List<T1150History>>> GetFor(string bDate, string eDate, int poyas);
	}


	/////////////////// SENSOR ERROR
	public interface ISensorErrorRepository : IRepository<SensorError>
	{
		Task<IEnumerable<SensorError>> GetErrors();
	}


	/////////////////// USAGE LOG
	public interface IUsageLogRepository : IRepository<UsageLog>
	{
		Task<IEnumerable<UsageLog>> GetForAll(string date, string ip);
		Task<IEnumerable<string>> GetIps();
	}

}