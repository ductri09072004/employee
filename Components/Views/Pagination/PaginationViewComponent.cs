using Microsoft.AspNetCore.Mvc;
using Components.Model.Pagination;

namespace Components.Views.Pagination
{
    public class PaginationViewComponent : ViewComponent
    {
        public IViewComponentResult Invoke(PaginationComponentModel model)
        {
            return View(model);
        }
    }
} 