import {
  deleteCategory,
  toggleFavorite,
} from "../../../services/category.service";

export default function CategoryItem({
  category,
  categories,
  onReload,
}: any) {

  const children = categories.filter(
    (c: any) => c.parentId === category._id
  );

  /* ================= FAVORITE ================= */

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();      // 🚀 chặn submit
    e.stopPropagation();     // 🚀 chặn bubble

    await toggleFavorite(category._id);
    onReload();              // reload data
  };

  /* ================= DELETE ================= */

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (category.isSystem) {
      alert("Không thể xóa danh mục hệ thống");
      return;
    }

    await deleteCategory(category._id);
    onReload();
  };

  return (
    <div className="cat-item">

      <div
        className="cat-item__box"
        style={{ background: category.color }}
      >
        {category.icon}
      </div>

      <span>{category.name}</span>

      {category.isFavorite && <span>⭐</span>}

      <div className="cat-actions">

        <button
          type="button"          // 🔥 QUAN TRỌNG
          onClick={handleFavorite}
        >
          Yêu thích
        </button>

        <button
          type="button"          // 🔥 QUAN TRỌNG
          onClick={handleDelete}
        >
          Xóa
        </button>

      </div>

      {children.length > 0 && (
        <div className="cat-children">
          {children.map((child: any) => (
            <CategoryItem
              key={child._id}
              category={child}
              categories={categories}
              onReload={onReload}
            />
          ))}
        </div>
      )}
    </div>
  );
}