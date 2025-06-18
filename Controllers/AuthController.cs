using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using JOLICOW.Models;

namespace JOLICOW.Controllers;

public class AuthController : Controller
{
    private readonly ILogger<AuthController> _logger;

    public AuthController(ILogger<AuthController> logger)
    {
        _logger = logger;
    }

    public IActionResult Login()
    {
        // Kiểm tra nếu đã đăng nhập thì chuyển về trang chủ
        var user = HttpContext.Session.GetString("User");
        if (!string.IsNullOrEmpty(user))
        {
            return RedirectToAction("Index", "Home");
        }
        return View();
    }

    [HttpPost]
    public IActionResult SetSession([FromBody] LoginRequest request)
    {
        try
        {
            // Lưu thông tin user vào session
            HttpContext.Session.SetString("User", request.Phone);
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting session");
            return StatusCode(500);
        }
    }

    public IActionResult Create_Staff()
    {
        return View();
    }

    [HttpPost]
    public IActionResult Create_Staff([FromBody] StaffData staffData)
    {
        try
        {
            // Lưu thông tin staff vào TempData
            TempData["StaffName"] = staffData.Name;
            TempData["StaffPhone"] = staffData.Phone;
            TempData["StaffPassword"] = staffData.Password;
            
            return Json(new { success = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving staff data");
            return Json(new { success = false, message = "Có lỗi xảy ra khi lưu thông tin nhân viên" });
        }
    }

    public IActionResult Create_Restaurant()
    {
        return View();
    }

    [HttpGet]
    public IActionResult GetStaffData()
    {
        var staffData = new StaffData
        {
            Name = TempData["StaffName"]?.ToString(),
            Phone = TempData["StaffPhone"]?.ToString(),
            Password = TempData["StaffPassword"]?.ToString()
        };

        return Json(staffData);
    }

    [HttpPost]
    public IActionResult Logout()
    {
        try
        {
            // Xóa session
            HttpContext.Session.Clear();
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during logout");
            return StatusCode(500);
        }
    }
}

public class StaffData
{
    public string Name { get; set; }
    public string Phone { get; set; }
    public string Password { get; set; }
}

public class LoginRequest
{
    public string Phone { get; set; }
}
