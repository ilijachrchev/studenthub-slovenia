function EventTagList({ tags = [], className = "event-tags" }) {
  if (!tags.length) return null;

  return (
    <div className={className}>
      {tags.map((tag) => (
        <span key={tag.id} className="event-tag">
          {tag.name}
        </span>
      ))}
    </div>
  );
}

export default EventTagList;