namespace Components.Model.Pagination
{
    public class PaginationComponentModel
    {
        public int CurrentPage { get; set; }
        public int TotalPages { get; set; }
        public int TotalItems { get; set; }
        public int ItemsPerPage { get; set; }
        public string PageAction { get; set; } = ""; // Tên action để gọi khi chuyển trang
    }
} 