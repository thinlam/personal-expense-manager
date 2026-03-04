import CategoryItem from "./CategoryItem";

export default function CategoryTree({ categories, onReload }: any) {
  const parents = categories.filter((c: any) => !c.parentId);

  return (
    <div>
      {parents.map((parent: any) => (
        <CategoryItem
          key={parent._id}
          category={parent}
          categories={categories}
          onReload={onReload}
        />
      ))}
    </div>
  );
}