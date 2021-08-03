using FurnaceHeat.Models.Middlewares;
using FurnaceHeat.Models.Repositories;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;


namespace FurnaceHeat
{
	public class Startup
	{
		public IConfiguration Configuration { get; }
		public Startup(IConfiguration configuration) => Configuration = configuration;



		public void ConfigureServices(IServiceCollection services)
		{
			services.AddSingleton<IHeatRepository, HeatRepository>();
			services.AddSingleton<IHistoryRepository, HistoryRepository>();
			services.AddSingleton<ISensorErrorRepository, SensorErrorRepository>();
			services.AddSingleton<IUsageLogRepository, UsageLogRepository>();

			services.AddSingleton<LoggingService>();

			services.AddControllers();
			services.AddRazorPages();
			services.AddSpaStaticFiles(configuration =>
			{
				configuration.RootPath = "ClientApp/build";
			});
		}


		public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
		{
			if (env.IsDevelopment())
				app.UseDeveloperExceptionPage();
			else
			{
				app.UseExceptionHandler("/Error");
				app.UseMiddleware<LoggingMiddleware>();
				//app.UseHsts();
			}

			//app.UseHttpsRedirection();
			app.UseStaticFiles();
			app.UseSpaStaticFiles();

			app.UseRouting();

			app.UseEndpoints(endpoints =>
			{
				endpoints.MapControllerRoute(
										name: "default",
										pattern: "{controller}/{action=Index}/{id?}");

				endpoints.MapRazorPages();
			});

			app.UseSpa(spa =>
			{
				spa.Options.SourcePath = "ClientApp";

				if (env.IsDevelopment())
					spa.UseReactDevelopmentServer(npmScript: "start");
			});
		}
	}
}
