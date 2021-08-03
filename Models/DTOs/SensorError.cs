using System;
using System.ComponentModel.DataAnnotations.Schema;


namespace FurnaceHeat.Models.DTOs
{
	public class SensorError
	{
		[Column("Date")]
		public DateTime Date { get; set; }

		[Column("Poyas")]
		public int Poyas { get; set; }

		[Column("Luch")]
		public int Luch { get; set; }

		[Column("Radius")]
		public int Radius { get; set; }

		[Column("Value")]
		public double Value { get; set; }
	}
}