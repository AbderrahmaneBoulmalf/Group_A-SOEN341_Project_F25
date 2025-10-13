import React, { useMemo, useState } from "react";
import axios from "axios";
import { message } from "antd";

import { Button } from "@/components/ui/button";

type InputEvent =
  | React.ChangeEvent<HTMLInputElement>
  | React.ChangeEvent<HTMLTextAreaElement>
  | React.ChangeEvent<HTMLSelectElement>;

interface EventFormData {
  title: string;
  date: string;
  organization: string;
  description: string;
  location: string;
  category: string;
  capacity: string;
  price: string;
  imageUrl: string;
  longDescription: string;
  requirements: string;
  contactEmail: string;
  contactPhone: string;
  tags: string;
  startTime: string;
  endTime: string;
  registrationDeadline: string;
  isOnline: boolean;
  meetingLink: string;
}

type FormErrors = Partial<Record<keyof EventFormData, string>>;

const initialFormState: EventFormData = {
  title: "",
  date: "",
  organization: "",
  description: "",
  location: "",
  category: "",
  capacity: "",
  price: "",
  imageUrl: "",
  longDescription: "",
  requirements: "",
  contactEmail: "",
  contactPhone: "",
  tags: "",
  startTime: "",
  endTime: "",
  registrationDeadline: "",
  isOnline: false,
  meetingLink: "",
};

const CreateEvents: React.FC = () => {
  const [formData, setFormData] = useState<EventFormData>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const requiredFields = useMemo<readonly (keyof EventFormData)[]>(
    () => [
      "title",
      "date",
      "organization",
      "description",
      "location",
      "category",
      "contactEmail",
    ],
    []
  );

  const handleInputChange = (event: InputEvent) => {
    const { name, value, type } = event.target;
    let inputValue: string | boolean = value;
    let checkedValue: boolean | undefined;
    if (type === "checkbox" && event.target instanceof HTMLInputElement) {
      checkedValue = event.target.checked;
      inputValue = checkedValue;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? inputValue : value,
      ...(name === "isOnline" && checkedValue === false ? { meetingLink: "" } : {}),
    }));
    if (errors[name as keyof EventFormData]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name as keyof EventFormData];
        return updated;
      });
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setErrors({});
  };

  const validateForm = () => {
    const validationErrors: FormErrors = {};
    requiredFields.forEach((field) => {
      const fieldValue = formData[field];
      if (
        typeof fieldValue === "string" &&
        fieldValue.trim().length === 0
      ) {
        validationErrors[field] = "This field is required.";
      }
    });

    const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
    if (!emailPattern.test(formData.contactEmail)) {
      validationErrors.contactEmail = "Enter a valid email address.";
    }

    const phonePattern = /^\+?[-\d\s()]{7,}$/;
    if (formData.contactPhone && !phonePattern.test(formData.contactPhone)) {
      validationErrors.contactPhone = "Enter a valid phone number.";
    }

    if (formData.capacity && Number(formData.capacity) < 0) {
      validationErrors.capacity = "Capacity cannot be negative.";
    }

    if (formData.price && Number(formData.price) < 0) {
      validationErrors.price = "Price cannot be negative.";
    }

    if (formData.isOnline && !formData.meetingLink.trim()) {
      validationErrors.meetingLink = "Provide a meeting link for online events.";
    }

    if (
      formData.registrationDeadline &&
      formData.date &&
      formData.registrationDeadline > formData.date
    ) {
      validationErrors.registrationDeadline =
        "Deadline cannot be after the event date.";
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) {
      messageApi.error("Please resolve the errors before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        date: formData.date,
        organization: formData.organization.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        category: formData.category.trim(),
        capacity:
          formData.capacity.trim() !== "" ? Number(formData.capacity) : null,
        price: formData.price.trim() !== "" ? Number(formData.price) : null,
        imageUrl: formData.imageUrl.trim() || null,
        longDescription: formData.longDescription.trim() || null,
        requirements: formData.requirements.trim() || null,
        contactEmail: formData.contactEmail.trim(),
        contactPhone: formData.contactPhone.trim() || null,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        startTime: formData.startTime || null,
        endTime: formData.endTime || null,
        registrationDeadline: formData.registrationDeadline || null,
        isOnline: formData.isOnline,
        meetingLink: formData.isOnline
          ? formData.meetingLink.trim() || null
          : null,
      };

      await axios.post("http://localhost:8787/api/events", payload, {
        withCredentials: true,
      });

      messageApi.success("Event created successfully.");
      resetForm();
    } catch (error) {
      console.error("Error creating event:", error);
      messageApi.error("Failed to create event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyles =
    "w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";

  return (
    <div className="ml-4 mr-4 mt-2 mb-10 flex h-[98%] items-start justify-center overflow-y-auto">
      {contextHolder}
      <div className="mt-4 w-full max-w-5xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">
            Create a New Event
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Provide the details below. Fields marked as required must be
            completed before submission.
          </p>
        </header>
        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="space-y-6">
            <h2 className="text-lg font-medium text-slate-800">Overview</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-medium text-slate-600"
                >
                  Event Title *
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={inputStyles}
                  placeholder="Enter event title"
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-red-500">{errors.title}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="organization"
                  className="mb-2 block text-sm font-medium text-slate-600"
                >
                  Organization *
                </label>
                <input
                  id="organization"
                  name="organization"
                  type="text"
                  value={formData.organization}
                  onChange={handleInputChange}
                  className={inputStyles}
                  placeholder="Hosted by"
                />
                {errors.organization && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.organization}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-medium text-slate-600"
                >
                  Category *
                </label>
                <input
                  id="category"
                  name="category"
                  type="text"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={inputStyles}
                  placeholder="e.g. Workshop, Seminar"
                />
                {errors.category && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.category}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="tags"
                  className="mb-2 block text-sm font-medium text-slate-600"
                >
                  Tags
                </label>
                <input
                  id="tags"
                  name="tags"
                  type="text"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className={inputStyles}
                  placeholder="Comma separated keywords"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-slate-600"
              >
                Short Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={`${inputStyles} min-h-[120px]`}
                placeholder="Brief overview of the event"
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.description}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="longDescription"
                className="mb-2 block text-sm font-medium text-slate-600"
              >
                Detailed Description
              </label>
              <textarea
                id="longDescription"
                name="longDescription"
                value={formData.longDescription}
                onChange={handleInputChange}
                className={`${inputStyles} min-h-[150px]`}
                placeholder="Include agenda, speakers, or additional context"
              />
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-lg font-medium text-slate-800">Schedule</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="date"
                  className="mb-2 block text-sm font-medium text-slate-600"
                >
                  Event Date *
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className={inputStyles}
                />
                {errors.date && (
                  <p className="mt-1 text-xs text-red-500">{errors.date}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="registrationDeadline"
                  className="mb-2 block text-sm font-medium text-slate-600"
                >
                  Registration Deadline
                </label>
                <input
                  id="registrationDeadline"
                  name="registrationDeadline"
                  type="date"
                  value={formData.registrationDeadline}
                  onChange={handleInputChange}
                  className={inputStyles}
                />
                {errors.registrationDeadline && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.registrationDeadline}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="startTime"
                  className="mb-2 block text-sm font-medium text-slate-600"
                >
                  Start Time
                </label>
                <input
                  id="startTime"
                  name="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className={inputStyles}
                />
              </div>
              <div>
                <label
                  htmlFor="endTime"
                  className="mb-2 block text-sm font-medium text-slate-600"
                >
                  End Time
                </label>
                <input
                  id="endTime"
                  name="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className={inputStyles}
                />
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-lg font-medium text-slate-800">
              Attendance & Logistics
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="location"
                  className="mb-2 block text-sm font-medium text-slate-600"
                >
                  Location *
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={inputStyles}
                  placeholder="Building, room, or venue"
                />
                {errors.location && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.location}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 pt-6">
                <input
                  id="isOnline"
                  name="isOnline"
                  type="checkbox"
                  checked={formData.isOnline}
                  onChange={handleInputChange}
                  className="size-5 rounded border border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="isOnline"
                  className="text-sm font-medium text-slate-600"
                >
                  This is an online event
                </label>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="capacity"
                  className="mb-2 block text-sm font-medium text-slate-600"
                >
                  Capacity
                </label>
                <input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min={0}
                  value={formData.capacity}
                  onChange={handleInputChange}
                  className={inputStyles}
                  placeholder="Maximum attendees"
                />
                {errors.capacity && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.capacity}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="price"
                  className="mb-2 block text-sm font-medium text-slate-600"
                >
                  Price (CAD)
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  min={0}
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={inputStyles}
                  placeholder="0.00"
                />
                {errors.price && (
                  <p className="mt-1 text-xs text-red-500">{errors.price}</p>
                )}
              </div>
            </div>
            <div>
              <label
                htmlFor="meetingLink"
                className="mb-2 block text-sm font-medium text-slate-600"
              >
                Meeting Link {formData.isOnline ? "*" : ""}
              </label>
              <input
                id="meetingLink"
                name="meetingLink"
                type="url"
                value={formData.meetingLink}
                onChange={handleInputChange}
                className={`${inputStyles} ${
                  !formData.isOnline ? "bg-slate-100" : ""
                }`}
                placeholder="https://..."
                disabled={!formData.isOnline}
              />
              {errors.meetingLink && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.meetingLink}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="requirements"
                className="mb-2 block text-sm font-medium text-slate-600"
              >
                Requirements
              </label>
              <textarea
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                className={`${inputStyles} min-h-[120px]`}
                placeholder="Materials, prerequisites, or attendance notes"
              />
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-lg font-medium text-slate-800">
              Media & Contact
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="imageUrl"
                  className="mb-2 block text-sm font-medium text-slate-600"
                >
                  Image URL
                </label>
                <input
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className={inputStyles}
                  placeholder="https://example.com/event-banner.jpg"
                />
              </div>
              <div>
                <label
                  htmlFor="contactPhone"
                  className="mb-2 block text-sm font-medium text-slate-600"
                >
                  Contact Phone
                </label>
                <input
                  id="contactPhone"
                  name="contactPhone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  className={inputStyles}
                  placeholder="+1 (555) 555-5555"
                />
                {errors.contactPhone && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.contactPhone}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label
                htmlFor="contactEmail"
                className="mb-2 block text-sm font-medium text-slate-600"
              >
                Contact Email *
              </label>
              <input
                id="contactEmail"
                name="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={handleInputChange}
                className={inputStyles}
                placeholder="contact@example.com"
              />
              {errors.contactEmail && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.contactEmail}
                </p>
              )}
            </div>
          </section>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={resetForm}
              disabled={isSubmitting}
            >
              Reset
            </Button>
            <Button type="submit" className="px-6 py-2" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Create Event"}
            </Button>
          </div>
        </form>
        <p className="mt-4 text-xs text-slate-500">
          * Required fields. Tags are stored as comma separated values and will
          be parsed into individual keywords on submission.
        </p>
      </div>
    </div>
  );
};

export default CreateEvents;
