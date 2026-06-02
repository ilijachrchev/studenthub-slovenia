function HomeFilters({filters, active, onChange}) {
  return (
    <div className="home-filters">
      {filters.map((filter) => (
        <button 
          key={filter}
          type="button" 
          className={filter === active ? "filter-chip active" : "filter-chip"}
          onClick={() => onChange(filter)}  
        >
          {filter}
        </button>
      ))}
    </div>
  );
}

export default HomeFilters;