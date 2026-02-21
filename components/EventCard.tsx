import React from 'react';
import type { Event, Category } from '@/lib/types';

interface EventCardProps {
  event: Event;
  categories: Category[];
  onClick: (event: Event) => void;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  categories,
  onClick,
}) => {
  const eventCategories = categories.filter((c) =>
    event.categories.includes(c.id),
  );
  const dateStr = new Date(event.startDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      onClick={() => onClick(event)}
      className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="relative h-48 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={event.banner}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          {eventCategories.map((cat) => (
            <span
              key={cat.id}
              className="bg-white/90 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-indigo-700 border border-indigo-100"
            >
              {cat.name}
            </span>
          ))}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center text-indigo-600 text-xs font-semibold mb-2">
          <svg
            className="w-3.5 h-3.5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {dateStr}
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1 line-clamp-1">
          {event.title}
        </h3>
        <p className="text-slate-500 text-sm line-clamp-2 mb-3">
          {event.description}
        </p>
        <div className="flex items-center text-slate-400 text-xs">
          <svg
            className="w-3.5 h-3.5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {event.location}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
