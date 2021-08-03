using System;

namespace FurnaceHeat.Models.DTOs
{
	public class UsageLog
	{
		public DateTime Date { get; set; }
		public string Ip { get; set; }
		public string Method { get; set; }
		public string Params { get; set; }
	}
}