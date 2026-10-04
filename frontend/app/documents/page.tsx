"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { getDocuments, getProjects, uploadDocument } from '@/lib/api';
import type { MockProject } from '@/contracts/project-full';
import type { ProjectDocument, UploadDocumentInput } from '@/contracts/workflows';
import { PageHeader, Panel, Button, StatusBadge, EmptyState } from '@/components/ui';

export default function DocumentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectFilter = searchParams.get('projectId') ?? 'all';
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [projects, setProjects] = useState<MockProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);
  
  const [uploadForm, setUploadForm] = useState({
    name: '',
    type: '',
    category: 'Engineering',
    description: ''
  });
  const [isUploading, setIsUploading] = useState(false);

  const selectedProject = projects.find((project) => project.id === projectFilter);
  const uploadProject = selectedProject ?? projects[0];

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [docs, projectData] = await Promise.all([
        getDocuments(projectFilter === 'all' ? undefined : projectFilter),
        getProjects()
      ]);
      setDocuments(docs);
      setProjects(projectData);
    } catch (err) {
      console.error(err);
      setError('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [projectFilter]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUploading(true);
      const input: UploadDocumentInput = {
        projectId: uploadProject?.id ?? '',
        projectName: uploadProject?.name ?? '',
        name: uploadForm.name,
        category: uploadForm.category,
        type: uploadForm.type,
        sizeLabel: '2.5 MB', // mock
        relatedTaskIds: [],
        description: uploadForm.description
      };

      if (!input.projectId) throw new Error('Select a project before uploading a document.');
      
      await uploadDocument(input);
      await fetchDocuments();
      setIsUploadOpen(false);
      setUploadForm({ name: '', type: '', category: 'Engineering', description: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const getVerificationTone = (status: string) => {
    switch (status) {
      case 'verified': return 'positive';
      case 'pending': return 'warning';
      case 'needs_review': return 'info';
      case 'expired': return 'neutral';
      default: return 'neutral';
    }
  };
  
  const getRequirementTone = (status: string) => {
    switch (status) {
      case 'satisfied': return 'positive';
      case 'needs_review': return 'warning';
      case 'missing': return 'critical';
      default: return 'neutral';
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Engineering', 'Utilities', 'Environmental', 'Safety', 'Operations', 'Other'];

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader 
          title="Documents" 
          description={selectedProject ? `Documents for ${selectedProject.name}.` : "Manage and review documents across all projects."}
          action={
            <Button variant="primary" onClick={() => setIsUploadOpen(true)}>
              Upload document
            </Button>
          }
        />

        <Panel>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search documents by name or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#27628a] focus:outline-none focus:ring-2 focus:ring-[#27628a]/20"
              />
            </div>
            <div className="w-full sm:w-48">
              <select
                value={projectFilter}
                onChange={(e) => router.push(e.target.value === 'all' ? '/documents' : `/documents?projectId=${encodeURIComponent(e.target.value)}`)}
                className="mb-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#27628a] focus:outline-none focus:ring-2 focus:ring-[#27628a]/20"
                aria-label="Filter documents by project"
              >
                <option value="all">All projects</option>
                {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#27628a] focus:outline-none focus:ring-2 focus:ring-[#27628a]/20"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse rounded-xl border border-slate-200 bg-[#f8fafc] h-32 w-full"></div>
              ))}
            </div>
          ) : error ? (
            <EmptyState 
              title="Error loading documents" 
              description={error} 
              action={<Button onClick={fetchDocuments}>Retry</Button>}
            />
          ) : filteredDocuments.length === 0 ? (
            <EmptyState 
              title="No documents found" 
              description="Upload a new document or adjust your search filters."
              action={
                <Button variant="primary" onClick={() => setIsUploadOpen(true)}>
                  Upload document
                </Button>
              }
            />
          ) : (
            <div className="space-y-4">
              {filteredDocuments.map(doc => (
                <div key={doc.id} className="rounded-xl border border-slate-200 bg-[#f8fafc] p-4 flex flex-col gap-4">
                  <div 
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer"
                    onClick={() => setExpandedDocId(expandedDocId === doc.id ? null : doc.id)}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-[#172b3a]">{doc.name}</span>
                        <StatusBadge tone="neutral">{doc.type}</StatusBadge>
                        <StatusBadge tone="info">{doc.category}</StatusBadge>
                      </div>
                      <div className="text-xs text-slate-500 flex gap-4">
                        <span>Project: {doc.projectName}</span>
                        <span>Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                        <span>Size: {doc.sizeLabel}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <StatusBadge tone={getVerificationTone(doc.verificationStatus)}>
                        Verification: {doc.verificationStatus.replace('_', ' ')}
                      </StatusBadge>
                      {doc.requirementStatus && (
                        <StatusBadge tone={getRequirementTone(doc.requirementStatus)}>
                          Req: {doc.requirementStatus.replace('_', ' ')}
                        </StatusBadge>
                      )}
                    </div>
                  </div>

                  {expandedDocId === doc.id && (
                    <div className="mt-2 pt-4 border-t border-slate-200 text-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-slate-700 mb-2">Details</h4>
                        <div className="space-y-2 text-slate-600">
                          <p><span className="font-medium">Description:</span> {doc.description || 'No description provided.'}</p>
                          <p><span className="font-medium">Document ID:</span> {doc.id}</p>
                          {doc.expiryAt && <p><span className="font-medium">Expiry:</span> {new Date(doc.expiryAt).toLocaleDateString()}</p>}
                          <p><span className="font-medium">Source Verification:</span> {doc.sourceVerificationStatus?.replace('_', ' ') || 'Unknown'}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-700 mb-2">Related Tasks</h4>
                        {doc.relatedTaskIds && doc.relatedTaskIds.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {doc.relatedTaskIds.map(taskId => (
                              <StatusBadge key={taskId} tone="neutral">{taskId}</StatusBadge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-500 italic">No related tasks</p>
                        )}
                        <div className="mt-4 flex gap-2">
                           <Button variant="secondary" size="sm">View full document</Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-[#172b3a] mb-4">Upload Document</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">File Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. site-plan-v2.pdf"
                  value={uploadForm.name}
                  onChange={e => setUploadForm({...uploadForm, name: e.target.value})}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#27628a] focus:outline-none focus:ring-2 focus:ring-[#27628a]/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Document Type</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. PDF, CAD"
                    value={uploadForm.type}
                    onChange={e => setUploadForm({...uploadForm, type: e.target.value})}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#27628a] focus:outline-none focus:ring-2 focus:ring-[#27628a]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={uploadForm.category}
                    onChange={e => setUploadForm({...uploadForm, category: e.target.value})}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#27628a] focus:outline-none focus:ring-2 focus:ring-[#27628a]/20"
                  >
                    {categories.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Project</label>
                <input
                  type="text"
                  readOnly
                  value={uploadProject?.name ?? 'Select a project'}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={uploadForm.description}
                  onChange={e => setUploadForm({...uploadForm, description: e.target.value})}
                  placeholder="Optional details about this document..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#27628a] focus:outline-none focus:ring-2 focus:ring-[#27628a]/20"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setIsUploadOpen(false)}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={isUploading || !uploadForm.name || !uploadForm.type}
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
