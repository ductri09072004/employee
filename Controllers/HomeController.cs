using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using JOLICOW.Models;

namespace JOLICOW.Controllers;

public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;

    public HomeController(ILogger<HomeController> logger)
    {
        _logger = logger;
    }

    public IActionResult Index()
    {
        return View();
    }

    public IActionResult QL_Order()
    {
        return View();
    }

    public IActionResult History()
    {
        return View();
    }

    public IActionResult QL_Table()
    {
        return View();
    }

    public IActionResult QL_Menu()
    {
        return View();
    }

    public IActionResult QL_Topping()
    {
        return View();
    }

    public IActionResult Setting()
    {
        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
