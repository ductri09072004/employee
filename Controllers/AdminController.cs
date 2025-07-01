using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using JOLICOW.Models;

namespace JOLICOW.Controllers;

public class AdminController : Controller
{
    private readonly ILogger<AdminController> _logger;

    public AdminController(ILogger<AdminController> logger)
    {
        _logger = logger;
    }

    public IActionResult Index()
    {
        // Kiểm tra xem có thông tin user trong session không
        var user = HttpContext.Session.GetString("User");
        if (string.IsNullOrEmpty(user))
        {
            // Nếu chưa đăng nhập, chuyển hướng về trang login
            return RedirectToAction("Login", "Auth");
        }
        return View();
    }

    public IActionResult QL_Res()
    {
        return View();
    }

    public IActionResult QL_TK()
    {
        return View();
    }

    public IActionResult Setting()
    {
        return View();
    }

    public IActionResult Check_Request()
    {
        return View();
    }

    public IActionResult QL_Notifi()
    {
        return View();
    }
}
