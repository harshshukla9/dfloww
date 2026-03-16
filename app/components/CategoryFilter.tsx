"use client";

interface CategoryFilterProps {
    categories: string[];
    selected: string;
    onSelect: (category: string) => void;
}

export function CategoryFilter({
    categories,
    selected,
    onSelect,
}: CategoryFilterProps) {
    const allCategories = ["All", ...categories];

    return (
        <div
            style={{
                display: "flex",
                gap: 8,
                overflowX: "auto",
                paddingBottom: 4,
                scrollbarWidth: "none",
            }}
        >
            {allCategories.map((cat) => {
                const isActive = selected === cat || (cat === "All" && !selected);

                return (
                    <button
                        key={cat}
                        onClick={() => onSelect(cat === "All" ? "" : cat)}
                        className={`pill ${isActive ? "pill-active" : ""}`}
                    >
                        {cat}
                    </button>
                );
            })}
        </div>
    );
}
