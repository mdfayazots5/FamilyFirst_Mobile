import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Camera, File, CheckCircle, AlertCircle, ChevronDown, User } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { VaultRepository, CATEGORY_LABELS } from '../repositories/VaultRepository';
import { FamilyRepository, FamilyMember } from '../../family/repositories/FamilyRepository';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFPageHeader from '../../../shared/components/FFPageHeader';

type Step = 'pick' | 'details' | 'uploading' | 'success' | 'error';

const DocumentUploadScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState<Step>('pick');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [documentName, setDocumentName] = useState('');
  const [category, setCategory] = useState(1);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [tags, setTags] = useState('');
  const [isEmergencyPriority, setIsEmergencyPriority] = useState(false);

  const [members, setMembers] = useState<FamilyMember[]>([]);

  useEffect(() => {
    if (!user?.familyId) return;
    FamilyRepository.getMembers(user.familyId).then(m => {
      setMembers(m);
      if (m.length > 0) setSelectedMemberId(m[0].id);
    });
  }, [user?.familyId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setDocumentName(file.name.replace(/\.[^/.]+$/, ''));
    if (file.type.startsWith('image/')) setPreviewUrl(URL.createObjectURL(file));
    setStep('details');
  };

  const handleUpload = async () => {
    if (!user?.familyId || !selectedFile || !selectedMemberId) return;
    setStep('uploading');
    try {
      const { uploadUrl, fileUrl } = await VaultRepository.getUploadUrl(
        user.familyId, selectedFile.name, selectedFile.type || 'application/octet-stream', category,
      );
      if (!uploadUrl.includes('demo-upload')) {
        await fetch(uploadUrl, { method: 'PUT', body: selectedFile, headers: { 'Content-Type': selectedFile.type } });
      }
      await VaultRepository.createDocument(user.familyId, {
        documentName: documentName.trim() || selectedFile.name,
        memberId: selectedMemberId, category, fileUrl,
        expiryDate: expiryDate || undefined,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        isEmergencyPriority,
      });
      setStep('success');
    } catch {
      setErrorMsg('Upload failed. Please check your connection and try again.');
      setStep('error');
    }
  };

  const inputClass = "w-full h-12 px-4 bg-white border border-black/5 rounded-xl font-body text-sm text-primary focus:outline-none focus:ring-1 focus:ring-primary/20";
  const labelClass = "font-body font-semibold text-xs text-gray-500 uppercase tracking-wider block mb-1.5";

  return (
    <div className="min-h-screen bg-bg-cream pb-24">
      <FFPageHeader title="Upload Document" showBack />

      <main className="px-4 pt-5 space-y-5 page-enter">

        {/* Step: pick source */}
        {step === 'pick' && (
          <div className="space-y-3">
            <p className="font-body text-sm text-gray-500 mb-4">Choose how to add your document</p>

            <label className="flex items-center gap-4 p-4 bg-white border border-black/5 rounded-ff shadow-card cursor-pointer hover:shadow-card-hover transition-all">
              <div className="p-3 bg-primary/10 rounded-xl flex-shrink-0">
                <Camera className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-display font-semibold text-sm text-primary">Take a Photo</p>
                <p className="font-body text-xs text-gray-400">Capture with camera</p>
              </div>
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
            </label>

            <label className="flex items-center gap-4 p-4 bg-white border border-black/5 rounded-ff shadow-card cursor-pointer hover:shadow-card-hover transition-all">
              <div className="p-3 bg-accent/10 rounded-xl flex-shrink-0">
                <File className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="font-display font-semibold text-sm text-primary">Choose File</p>
                <p className="font-body text-xs text-gray-400">PDF, JPG, PNG, HEIC</p>
              </div>
              <input type="file" accept="application/pdf,image/jpeg,image/png,image/heic,image/heif" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
        )}

        {/* Step: details */}
        {step === 'details' && (
          <div className="space-y-4">
            {previewUrl && (
              <img src={previewUrl} alt="Preview" className="w-full h-40 object-cover rounded-ff" />
            )}

            <div>
              <label className={labelClass}>Document Name *</label>
              <input
                value={documentName}
                onChange={e => setDocumentName(e.target.value)}
                className={inputClass}
                placeholder="e.g. Arjun Passport"
              />
            </div>

            <div>
              <label className={labelClass}>For which member? *</label>
              {members.length === 0 ? (
                <div className="flex items-center gap-2 h-12 px-4 bg-white border border-black/5 rounded-xl">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="font-body text-sm text-gray-400">Loading members…</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {members.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMemberId(m.id)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-colors ${
                        selectedMemberId === m.id
                          ? 'border-primary bg-primary text-white'
                          : 'border-black/5 bg-white text-primary'
                      }`}
                    >
                      <User className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="font-body text-xs font-semibold truncate">{m.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className={labelClass}>Category *</label>
              <div className="relative">
                <select
                  value={category}
                  onChange={e => setCategory(Number(e.target.value))}
                  className={`${inputClass} appearance-none`}
                >
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className={labelClass}>
                Expiry Date{' '}
                {[2, 5].includes(category) && (
                  <span className="text-accent normal-case font-normal">(Recommended)</span>
                )}
              </label>
              <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Tags (comma separated)</label>
              <input
                value={tags}
                onChange={e => setTags(e.target.value)}
                className={inputClass}
                placeholder="passport, travel, 2025"
              />
            </div>

            <FFCard className="p-4 flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="font-display font-semibold text-sm text-primary">Emergency Priority</p>
                <p className="font-body text-xs text-gray-400 mt-0.5">Show in Emergency Folder (max 5 per family)</p>
              </div>
              <button
                onClick={() => setIsEmergencyPriority(v => !v)}
                className={`w-12 h-6 rounded-full transition-colors flex-shrink-0 relative ${isEmergencyPriority ? 'bg-alert' : 'bg-black/10'}`}
                aria-label="Toggle emergency priority"
              >
                <span className={`block w-5 h-5 bg-white rounded-full shadow mx-0.5 transition-transform ${isEmergencyPriority ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </FFCard>

            <FFButton onClick={handleUpload} disabled={!documentName.trim() || !selectedMemberId} className="w-full">
              Upload Document
            </FFButton>
          </div>
        )}

        {/* Step: uploading */}
        {step === 'uploading' && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <p className="font-display font-semibold text-sm text-primary">Uploading securely…</p>
            <p className="font-body text-xs text-gray-400">This may take a moment</p>
          </div>
        )}

        {/* Step: success */}
        {step === 'success' && (
          <div className="flex flex-col items-center justify-center py-16 space-y-5">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <p className="font-display font-semibold text-lg text-primary">Document Saved!</p>
            <p className="font-body text-sm text-gray-500 text-center">Your document is securely stored in the vault.</p>
            <div className="flex gap-3 w-full">
              <FFButton
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setStep('pick');
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setDocumentName('');
                  setTags('');
                  setExpiryDate('');
                  setIsEmergencyPriority(false);
                }}
              >
                Upload Another
              </FFButton>
              <FFButton className="flex-1" onClick={() => navigate('/vault')}>Go to Vault</FFButton>
            </div>
          </div>
        )}

        {/* Step: error */}
        {step === 'error' && (
          <div className="flex flex-col items-center justify-center py-16 space-y-5">
            <div className="w-16 h-16 bg-alert/10 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-alert" />
            </div>
            <p className="font-display font-semibold text-sm text-primary">Upload Failed</p>
            <p className="font-body text-sm text-gray-500 text-center">{errorMsg}</p>
            <FFButton className="w-full" onClick={() => setStep('details')}>Try Again</FFButton>
          </div>
        )}
      </main>
    </div>
  );
};

export default DocumentUploadScreen;
