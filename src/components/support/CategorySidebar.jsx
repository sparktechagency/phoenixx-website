const CategorySidebar = ({ categories, activeCategory, onCategoryClick }) => (
  <div className="md:col-span-1">
    <ul className="space-y-4">
      {categories.map((category) => (
        <li
          key={category._id}
          className={`cursor-pointer font-medium ${activeCategory === category._id ? 'text-blue-600' : 'text-gray-700'
            }`}
          onClick={() => onCategoryClick(category._id)}
        >
          {category.name}
        </li>
      ))}
    </ul>
  </div>
);


export default CategorySidebar;
