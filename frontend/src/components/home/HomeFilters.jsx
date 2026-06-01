function HomeFilters() {
  const filters = ["All", "Hackathon", "Workshop", "Lecture", "Career"];

  return (
    <div className="home-filters">
      {filters.map((filter) => (
        <button key={filter} className={filter === "All" ? "filter-chip active" : "filter-chip"}>
          {filter}
        </button>
      ))}
    </div>
  );
}

export default HomeFilters;