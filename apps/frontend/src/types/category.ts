export interface Category {
  _id?: string;
  name: string;
  type: "income" | "expense";
  parentId?: string | null;
  icon: string;
  color: string;
  isFavorite: boolean;
  isSystem: boolean;
}