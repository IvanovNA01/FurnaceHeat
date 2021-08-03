using System.ComponentModel.DataAnnotations.Schema;

namespace FurnaceHeat.Models.DTOs
{
  public class Sensor
  {
    [Column("name")]
    public string Name { get; set; }

    [Column("val")]
    public double Value { get; set; }
  }
}