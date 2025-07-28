using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using JOLICOW.Models;

namespace JOLICOW.Controllers;

public class StartController : Controller
{
    private readonly ILogger<StartController> _logger;

    public StartController(ILogger<StartController> logger)
    {
        _logger = logger;
    }

    public IActionResult Landing()
    {
        return View();
    }

    public IActionResult About()
    {
        return View();
    }
    public IActionResult Privacy()
    {
        return View();
    }
}
