const REG_TYPES = [
    { value: "built_in", label: "Built-in registration" },
    { value: "external", label: "External link" },
    { value: "none", label: "No registration" },
];

function EventRegistrationType({registrationType, capacity, externalUrl, onTypeChange, onCapacityChange, onExternalUrlChange}) {

    return (
        <div className="form-section">
            <h2 className="form-section-title">Registration</h2>

            <div className="reg-type-options">
                {REG_TYPES.map((types_of_reg) => (
                    <button 
                        key={types_of_reg.value}
                        type="button"
                        className={`reg-type-chip ${registrationType === types_of_reg.value ? "selected" : ""}`}
                        onClick={() => onTypeChange(types_of_reg.value)}
                    >
                        {types_of_reg.label}
                    </button>
                ))}
            </div>

            {registrationType === "built_in" && (
                <>
                    <label className="form-label">Capacity</label>
                    <input 
                        className="input"
                        type="number"
                        min="1"
                        value={capacity}
                        onChange={(e) => onCapacityChange(e.target.value)}
                        placeholder="e.g. 100"
                    />
                </>
            )}

            {registrationType === "external" && (
                <>
                    <label className="form-label">External Link<span className="required">*</span></label>
                    <input 
                        className="input"
                        value={externalUrl}
                        onChange={(e) => onExternalUrlChange(e.target.value)}
                        placeholder="https://..."
                    />
                </>
            )}
        </div>
    );
}

export default EventRegistrationType;