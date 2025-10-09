import React, { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Spin, message } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

type EventPayload = {
  id: string;
  title: string;
  date: string; // "YYYY-MM-DD" from <input type="date">
  organization: string;
  description: string;
  location: string;
  category: string;
};

const CreateEvent: React.FC = () => {
  const [title, setTitle] = useState<string>("");
  const [date, setDate] = useState<string>(""); // keep as string from <input type="date">
  const [organization, setOrganization] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [category, setCategory] = useState<string>("");

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const valid =
      title.trim().length >= 3 &&
      date.trim().length > 0 &&
      organization.trim().length > 0 &&
      description.trim().length > 0 &&
      location.trim().length > 0 &&
      category.trim().length > 0;
    setIsFormValid(valid);
  }, [title, date, organization, description, location, category]);

  const eventPayload: EventPayload = {
    title: title.trim(),
    date, // keep as "YYYY-MM-DD"
    organization: organization.trim(),
    description: description.trim(),
    location: location.trim(),
    category: category.trim(),
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setSubmitting(true);

    // TODO: replace this with your actual create-event API call
    setTimeout(() => {
      setSubmitting(false);
      messageApi.success("Event created successfully!");
      console.log("Event created:");
      console.log(eventPayload); // JSON-style view
      console.table([eventPayload]);

      // Optionally reset form:
      // setId(""); setTitle(""); setDate(""); setOrganization(""); setDescription(""); setLocation(""); setCategory("");
    }, 900);
  };

  return (
    <>
      {contextHolder}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
        <Navbar />
        <div className="flex items-center justify-center flex-grow">
          <form
            onSubmit={onSubmit}
            className="bg-white rounded-xl shadow-lg p-10 w-full md:max-w-md xl:max-w-lg space-y-8 border-0 py-10"
          >
            <h2 className="text-3xl font-bold text-slate-800 mb-4 text-center font-poppins">
              Create Event
            </h2>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-slate-700 font-medium mb-1"
                >
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Event title"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 bg-slate-50"
                />
                <p
                  className={`mt-2 text-xs text-red-500 ${
                    title && title.trim().length >= 3 ? "invisible" : "visible"
                  }`}
                >
                  Title must be at least 3 characters.
                </p>
              </div>

              {/* Date */}
              <div>
                <label
                  htmlFor="date"
                  className="block text-slate-700 font-medium mb-1"
                >
                  Date
                </label>
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 bg-slate-50"
                />
                <p
                  className={`mt-2 text-xs text-red-500 ${
                    date ? "invisible" : "visible"
                  }`}
                >
                  Date is required.
                </p>
              </div>

              {/* Organization */}
              <div>
                <label
                  htmlFor="organization"
                  className="block text-slate-700 font-medium mb-1"
                >
                  Organization
                </label>
                <input
                  id="organization"
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Organizer name"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 bg-slate-50"
                />
                <p
                  className={`mt-2 text-xs text-red-500 ${
                    organization ? "invisible" : "visible"
                  }`}
                >
                  Organization is required.
                </p>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-slate-700 font-medium mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="Brief summary of the event"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 bg-slate-50 resize-vertical"
                />
                <p
                  className={`mt-2 text-xs text-red-500 ${
                    description && description.trim().length >= 10
                      ? "invisible"
                      : "visible"
                  }`}
                >
                  Description must be at least 10 characters.
                </p>
              </div>

              {/* Location */}
              <div>
                <label
                  htmlFor="location"
                  className="block text-slate-700 font-medium mb-1"
                >
                  Location
                </label>
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, venue, or address"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 bg-slate-50"
                />
                <p
                  className={`mt-2 text-xs text-red-500 ${
                    location ? "invisible" : "visible"
                  }`}
                >
                  Location is required.
                </p>
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-slate-700 font-medium mb-1"
                >
                  Category
                </label>
                <input
                  id="category"
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Tech, Fitness, Art..."
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 bg-slate-50"
                />
                {/* <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 bg-white"
                >
                  <option value="">Select a category</option>
                  <option value="conference">Conference</option>
                  <option value="workshop">Workshop</option>
                  <option value="meetup">Meetup</option>
                  <option value="webinar">Webinar</option>
                  <option value="competition">Competition</option>
                  <option value="other">Other</option>
                </select> */}
                <p
                  className={`mt-2 text-xs text-red-500 ${
                    category ? "invisible" : "visible"
                  }`}
                >
                  Category is required.
                </p>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 min-w-[200px] w-full border-0"
              disabled={!isFormValid || submitting}
            >
              {submitting ? (
                <Spin
                  indicator={<LoadingOutlined spin style={{ color: "gray" }} />}
                  size="default"
                />
              ) : (
                "Create Event"
              )}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateEvent;
