"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { PageHeader, Button, Panel } from "@/components/ui";
import { createProject } from "@/lib/api";
import type { CreateProjectInput, ProjectStage, SiteStatus } from "@/contracts/project-full";

export default function NewProjectPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState<CreateProjectInput>({
    name: "",
    organization: "",
    sector: "Manufacturing",
    description: "",
    location: "",
    stage: "planning" as ProjectStage,
    investmentAmount: "",
    siteStatus: "unallocated" as SiteStatus,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateProjectInput, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    const newErrors: Partial<Record<keyof CreateProjectInput, string>> = {};
    if (!formData.name.trim()) newErrors.name = "Project name is required";
    if (!formData.organization.trim()) newErrors.organization = "Organization name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      await createProject(formData);
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/projects");
      }, 1500);
    } catch (err) {
      console.error(err);
      alert("Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof CreateProjectInput]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const inputClass = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-[#172b3a] focus:border-[#27628a] focus:outline-none focus:ring-2 focus:ring-[#27628a]/20";
  const labelClass = "block text-sm font-medium text-[#172b3a] mb-1.5";
  const errorClass = "text-xs text-red-600 mt-1";

  return (
    <AppShell>
      <PageHeader
        title="New Project"
        description="Create a new industrial project profile."
      />

      <div className="mx-auto max-w-3xl p-6">
        {isSuccess ? (
          <Panel className="text-center py-12">
            <h2 className="text-2xl font-bold text-[#27628a] mb-2">Project Created Successfully!</h2>
            <p className="text-slate-500">Redirecting to projects list...</p>
          </Panel>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Panel>
              <h3 className="text-lg font-bold text-[#172b3a] mb-4 pb-2 border-b border-slate-100">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Project Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g. Apex Textile Expansion"
                  />
                  {errors.name && <p className={errorClass}>{errors.name}</p>}
                </div>
                
                <div>
                  <label className={labelClass}>Organization Name *</label>
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g. Apex Industries Ltd"
                  />
                  {errors.organization && <p className={errorClass}>{errors.organization}</p>}
                </div>

                <div>
                  <label className={labelClass}>Industry Sector</label>
                  <select
                    name="sector"
                    value={formData.sector}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Food processing">Food processing</option>
                    <option value="Textiles">Textiles</option>
                    <option value="Metals">Metals</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Automotive">Automotive</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className={`${inputClass} min-h-[80px] resize-y`}
                    placeholder="Brief description of the project"
                  />
                </div>
              </div>
            </Panel>

            <Panel>
              <h3 className="text-lg font-bold text-[#172b3a] mb-4 pb-2 border-b border-slate-100">Location</h3>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>State / District / City</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g. Vadodara, Gujarat"
                  />
                </div>
              </div>
            </Panel>

            <Panel>
              <h3 className="text-lg font-bold text-[#172b3a] mb-4 pb-2 border-b border-slate-100">Project Details</h3>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Project Stage</label>
                  <select
                    name="stage"
                    value={formData.stage}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="planning">Planning</option>
                    <option value="land_acquisition">Land Acquisition</option>
                    <option value="construction">Construction</option>
                    <option value="pre_operational">Pre-operational</option>
                    <option value="operational">Operational</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Investment Amount</label>
                  <input
                    type="text"
                    name="investmentAmount"
                    value={formData.investmentAmount}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g. ₹50 Cr, $10M"
                  />
                </div>

                <div>
                  <label className={labelClass}>Site Status</label>
                  <select
                    name="siteStatus"
                    value={formData.siteStatus}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="unallocated">Unallocated</option>
                    <option value="allocated">Allocated</option>
                    <option value="possession_taken">Possession Taken</option>
                    <option value="developed">Developed</option>
                  </select>
                </div>
              </div>
            </Panel>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => router.push("/projects")}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </AppShell>
  );
}
