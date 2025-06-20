namespace Components.Model.Table
{
    public class TableComponentModel
    {
        public List<string> ColumnNames { get; set; } = new();
        public string TableBodyId { get; set; } = "table-list-body";
        // Có thể thêm các thuộc tính khác nếu cần
    }
} 