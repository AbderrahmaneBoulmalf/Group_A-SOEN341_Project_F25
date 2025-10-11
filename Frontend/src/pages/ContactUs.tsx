import React, { useState } from "react";
import Navbar from "@/components/navbar";

const ContactUs: React.FC = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name && form.email && form.message) {
      setSubmitted(true);
      setForm({ name: "", email: "", message: "" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800">
      <Navbar />

      <section className="max-w-5xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center text-blue-700 mb-10">
          Contact Us
        </h1>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Contact Form */}
          <div className="bg-white shadow-md rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-blue-700 mb-6">
              Send us a message
            </h2>

            {submitted && (
              <p className="text-green-600 font-medium mb-4">
                Your message has been sent successfully!
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block font-medium mb-2">Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div>
                <label className="block font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block font-medium mb-2">Message</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  className="w-full p-3 border border-slate-300 rounded-lg h-32 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Write your message..."
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-all"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="bg-white shadow-md rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-blue-700 mb-6">
              Get in touch
            </h2>
            <p className="text-slate-700 mb-4">
              Have questions or feedback about EventHub? Reach out to our team.
            </p>

            <ul className="space-y-3 text-slate-700">
              <li>
                <strong>Email:</strong> support@eventhub.com
              </li>
              <li>
                <strong>Phone:</strong> +1 (514) 123-4567
              </li>
              <li>
                <strong>Location:</strong> Concordia University, Montreal, QC
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;
