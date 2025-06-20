using Microsoft.AspNetCore.Mvc;
using Components.Model.Table;

namespace Components.Views.Table
{
    public class TableViewComponent : ViewComponent
    {
        public IViewComponentResult Invoke(List<string> columnNames, string tableBodyId = "table-list-body")
        {
            var model = new TableComponentModel
            {
                ColumnNames = columnNames,
                TableBodyId = tableBodyId
            };
            return View(model);
        }
    }
} 