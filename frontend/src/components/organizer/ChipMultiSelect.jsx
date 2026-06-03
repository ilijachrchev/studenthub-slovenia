function ChipMultiSelect({ title, required, items, selectedIds, onToggle }) {
    return (
        <div className="form-section">
            <h2 className="form-section-title">
                {title}
                {required && <span className="required">*</span>}
            </h2>
            <div className="tag-list">
                {items.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        className={`tag-chip ${selectedIds.includes(item.id) ? "selected" : ""}`}
                        onClick={() => onToggle(item.id)}
                    >
                        {item.name}
                    </button>
                ))}
            </div>
        </div>
    );
} 

export default ChipMultiSelect;