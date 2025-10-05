import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import type { Event } from "../types/Event";

const Events: React.FC = () => {
  // Sample event data - in a real app, this would come from an API
  const [events] = useState<Event[]>([
    {
      id: "1",
      title: "Tech Conference 2024",
      date: "2024-03-15",
      organization: "Concordia University",
      description: "Annual technology conference featuring industry leaders and innovative presentations.",
      location: "Hall Building, Room H-110",
      category: "Technology"
    },
    {
      id: "2",
      title: "Career Fair",
      date: "2024-03-22",
      organization: "Student Services",
      description: "Connect with top employers and explore career opportunities.",
      location: "Gymnasium",
      category: "Career"
    },
    {
      id: "3",
      title: "Cultural Night",
      date: "2024-04-05",
      organization: "International Students Association",
      description: "Celebrate diversity with performances, food, and cultural displays.",
      location: "Student Center",
      category: "Cultural"
    },
    {
      id: "4",
      title: "Hackathon",
      date: "2024-04-12",
      organization: "Computer Science Society",
      description: "48-hour coding competition with prizes and networking opportunities.",
      location: "Engineering Building",
      category: "Technology"
    },
    {
      id: "5",
      title: "Research Symposium",
      date: "2024-04-20",
      organization: "Graduate Studies",
      description: "Showcase of graduate research projects and findings.",
      location: "Library Conference Room",
      category: "Academic"
    },
    {
      id: "6",
      title: "Sports Tournament",
      date: "2024-05-01",
      organization: "Athletics Department",
      description: "Annual inter-departmental sports competition.",
      location: "Sports Complex",
      category: "Sports"
    }
  ]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Technology: "bg-blue-100 text-blue-800",
      Career: "bg-green-100 text-green-800",
      Cultural: "bg-purple-100 text-purple-800",
      Academic: "bg-orange-100 text-orange-800",
      Sports: "bg-red-100 text-red-800"
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4 font-poppins">
            Upcoming Events
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Discover and join exciting events happening around campus
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card 
              key={event.id} 
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border-0 hover:-translate-y-1"
            >
              {/* Category Badge */}
              {event.category && (
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(event.category)}`}>
                    {event.category}
                  </span>
                </div>
              )}

              {/* Event Title */}
              <h3 className="text-xl font-semibold text-slate-800 mb-3 line-clamp-2">
                {event.title}
              </h3>

              {/* Event Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-slate-600">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">{formatDate(event.date)}</span>
                </div>

                <div className="flex items-center text-slate-600">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>{event.organization}</span>
                </div>

                {event.location && (
                  <div className="flex items-center text-slate-600">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{event.location}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              {event.description && (
                <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                  {event.description}
                </p>
              )}

              {/* Action Button */}
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                View Details
              </Button>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {events.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No events found</h3>
            <p className="text-slate-500">Check back later for upcoming events!</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Events;
