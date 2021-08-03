using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;


namespace FurnaceHeat.Models.Middlewares
{
	public class LoggingMiddleware
	{
		private readonly RequestDelegate _next;
		private readonly LoggingService _service;



		public LoggingMiddleware(RequestDelegate next, LoggingService service)
		{
			_next = next;
			_service = service;
		}


		public async Task InvokeAsync(HttpContext context)
		{
			await _service.Log(context);
			await _next.Invoke(context);
		}
	}
}