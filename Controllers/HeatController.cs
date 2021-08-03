using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FurnaceHeat.Models.DTOs;
using FurnaceHeat.Models.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace FurnaceHeat.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	public class HeatController : ControllerBase
	{
		private readonly IConfiguration _config;
		private readonly IHeatRepository _repo;
		private readonly IHistoryRepository _hRepo;
		private readonly IUsageLogRepository _uRepo;
		private readonly ISensorErrorRepository _eRepo;



		public HeatController(IHeatRepository repo, IHistoryRepository hRepo, ISensorErrorRepository eRepo, IUsageLogRepository uRepo, IConfiguration config)
		{
			_repo = repo;
			_hRepo = hRepo;
			_eRepo = eRepo;
			_uRepo = uRepo;
			_config = config;
		}


		// instant temperature data
		[HttpGet("Instant")] /////////// GET: api/Heat/Instant
		public async Task<Dictionary<string, List<Sensor>>> Instant() => await _repo.Instant();


		// certain date temperature data
		[HttpGet("GetFor")] //////////// GET: api/Heat/GetFor?dt=...
		public async Task<ActionResult<IEnumerable<Sensor>>> GetFor(string dt)
		{
			try
			{
				var result = await _repo.GetFor(dt);
				if (result.Count() < 292)
					return BadRequest($"No data for {dt}");
				return Ok(result);
				//System.IO.File.WriteAllText(dt.ToString("YYYY-MM-DD") + ".json", JsonConvert.SerializeObject(result));
			}
			catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
		}


		// two dates temperature data
		[HttpGet("GetForInterval")] //////////// GET: api/Heat/GetForInterval?bDate=...&eDate=...
		public async Task<ActionResult<Dictionary<string, IEnumerable<Sensor>>>> GetFor(string bDate, string eDate)
		{
			try
			{
				var result = await _repo.GetFor(bDate, eDate);
				return Ok(result);
			}
			catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
		}


		// certain date interval and poyas temperature data
		[HttpGet("GetIntervalFor")] ////////// GET: api/Heat/GetIntervalFor?bDate=...&eDate=...&poyas=...
		public async Task<ActionResult<IEnumerable<Sensor>>> GetIntervalFor(string bDate, string eDate, int poyas)
		{
			try
			{
				var result = await _repo.GetIntervalFor(bDate, eDate, poyas);
				if (result.Count() == 0)
					return BadRequest("No data for interval");

				return Ok(result);
			}
			catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
		}


		// gets history data for certain dates interval and certain poyas
		[HttpGet("PullDate")] /////// GET: api/Heat/PullDate?bDate=...&eDate=...&poyas=...
		public async Task<ActionResult<IEnumerable<T1150History>>> PullDate(string bDate, string eDate, int poyas)
		{
			try
			{
				var t1150 = await _hRepo.GetFor(bDate, eDate, poyas);

				return Ok(t1150);
			}
			catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
		}


		[HttpPut("PutDate")] /////// PUT: api/Heat/PutDate
		public async Task<ActionResult<int>> PutDate(T1150History[] arr)
		{
			try
			{
				var result = await _hRepo.Put(arr);
				if (result == 0)
					return BadRequest(new { error = "Couldn't push the obj" });

				return Ok(result);
			}
			catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
		}


		// retrieves sensor errors
		[HttpGet("GetSensorErrors")] /////////// GET: api/Heat/GetSensorErrors
		public async Task<ActionResult<IEnumerable<SensorError>>> GetSensorErrors()
		{
			try
			{
				var result = await _eRepo.GetErrors();
				return Ok(result);
			}
			catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
		}


		// writes new sensor errors
		[HttpPut("PutSensorErrors")] /////////// PUT: api/Heat/PutSensorErrors
		public async Task<ActionResult<int>> PutSensorErrors(SensorError[] arr)
		{
			try
			{
				var result = await _eRepo.Put(arr);
				if (result == 0)
					return BadRequest(new { error = "Couldn't push the obj" });

				return Ok(result);
			}
			catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
		}


		[HttpGet("GetUsageIps")] ////////// GET: api/Heat/GetUsageIps
		public async Task<ActionResult<IEnumerable<string>>> GetUsageIps()
		{
			try { return Ok(await _uRepo.GetIps()); }
			catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
		}


		[HttpGet("GetUsageFor")] /////////// GET: api/Heat/GetUsageFor?what=...
		public async Task<ActionResult<IEnumerable<UsageLog>>> GetUsageFor(string what)
		{
			try { return Ok(await _uRepo.GetFor(what)); }
			catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
		}


		[HttpGet("GetUsageForAll")] /////////// GET: api/Heat/GetUsageFor?dt=...&ip=...
		public async Task<ActionResult<IEnumerable<UsageLog>>> GetUsageForAll(string dt, string ip)
		{
			try { return Ok(await _uRepo.GetForAll(dt, ip)); }
			catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
		}


		[HttpGet("{action}")] /////////// GET: api/Heat/GetAppVersion
		public Task<string> GetAppVersion() => Task.FromResult(_config.GetValue<string>("AppVersion"));
	}
}