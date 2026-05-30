import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Camera, File, CheckCircle, AlertCircle, ChevronDown, User } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { VaultRepository, CATEGORY_LABELS } from '../repositories/VaultRepository';
import { FamilyRepository, FamilyMember } from '../../family/repositories/FamilyRepository';
import FFButton from '../../../shared/components/FFButton';

type Step = 'pick' | 'details' | 'uploading' | 'success' | 'error';

const DocumentUploadScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState<Step>('pick');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form state
  const [documentName, setDocumentName] = useState('');
  const [category, setCategory] = useState(1);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [tags, setTags] = useState('');
  const [isEmergencyPriority, setIsEmergencyPriority] = useState(false);

  // Member picker
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
    if (file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file));
    }
    setStep('details');
  };

  const handleUpload = async () => {
    if (!user?.familyId || !selectedFile || !selectedMemberId) return;
    setStep('uploading');
    try {
      const { uploadUrl, fileUrl } = await VaultRepository.getUploadUrl(
        user.familyId,
        selectedFile.name,
        selectedFile.type || 'application/octet-stream',
        category,
      );

      if (!uploadUrl.includes('demo-upload')) {
        await fetch(uploadUrl, {
          method: 'PUT',
          body: selectedFile,
          headers: { 'Content-Type': selectedFile.type },
        });
      }

      await VaultRepository.createDocument(user.familyId, {
        documentName: documentName.trim() || selectedFile.name,
        memberId: selectedMemberId,
        category,
        fileUrl,
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

  return (
    <div className="min-h-screen bg-[#F8F4EE]">
      {/* Header */}
      <div className="bg-[#1A2E4A] px-5 pt-12 pb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white/10">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Upload Document
          </h1>
        </div>
      </div>

      <div className="px-4 pt-6 pb-24 space-y-5">

        {/* Step: pick source */}
        {step === 'pick' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 mb-4">Choose how to add your document</p>

            <label className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition-all">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Camera className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1A2E4A]">Take a Photo</p>
                <p className="text-xs text-gray-400">Capture with camera</p>
              </div>
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
            </label>

            <label className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition-all">
              <div className="p-3 bg-purple-50 rounded-xl">
                <File className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1A2E4A]">Choose File</p>
                <p className="text-xs text-gray-400">PDF, JPG, PNG, HEIC</p>
              </div>
              <input
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/heic,image/heif"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
        )}

        {/* Step: details */}
        {step === 'details' && (
          <div className="space-y-4">
            {previewUrl && (
              <img src={previewUrl} alt="Preview" className="w-full h-40 object-cover rounded-2xl" />
            )}

            {/* Document Name */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                Document Name *
              </label>
              <input
                value={documentName}
                onChange={e => setDocumentName(e.target.value)}
                className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2E4A]"
                placeholder="e.g. Arjun Passport"
              />
            </div>

            {/* Family Member picker */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                For which member? *
              </label>
              {members.length === 0 ? (
                <div className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl border border-gray-200">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Loading members…</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {members.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMemberId(m.id)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-colors
                        ${selectedMemberId === m.id
                          ? 'border-[#1A2E4A] bg-[#1A2E4A] text-white'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`}
                    >
                      <User className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="text-xs font-medium truncate">{m.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                Category *
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={e => setCategory(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#1A2E4A]"
                >
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Expiry date */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                Expiry Date{' '}
                {[2, 5].includes(category) && (
                  <span className="text-amber-600 normal-case">(Recommended for this category)</span>
                )}
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={e => setExpiryDate(e.target.value)}
                className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2E4A]"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                Tags (comma separated)
              </label>
              <input
                value={tags}
                onChange={e => setTags(e.target.value)}
                className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2E4A]"
                placeholder="passport, travel, 2025"
              />
            </div>

            {/* Emergency Priority */}
            <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm">
              <div>
                <p className="text-sm font-semibold text-[#1A2E4A]">Emergency Priority</p>
                <p className="text-xs text-gray-400">Show in Emergency Folder (max 5 per family)</p>
              </div>
              <button
                onClick={() => setIsEmergencyPriority(v => !v)}
                className={`w-12 h-6 rounded-full transition-colors ${isEmergencyPriority ? 'bg-red-500' : 'bg-gray-200'}`}
              >
                <span className={`block w-5 h-5 bg-white rounded-full shadow mx-0.5 transition-transform
                  ${isEmergencyPriority ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <FFButton
              onClick={handleUpload}
              disabled={!documentName.trim() || !selectedMemberId}
              className="w-full"
            >
              Upload Document
            </FFButton>
          </div>
        )}

        {/* Step: uploading */}
        {step === 'uploading' && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-blue-500 animate-pulse" />
            </div>
            <p className="text-sm font-semibold text-[#1A2E4A]">Uploading securely…</p>
            <p className="text-xs text-gray-400">This may take a moment</p>
          </div>
        )}

        {/* Step: success */}
        {step === 'success' && (
          <div className="flex flex-col items-center justify-center py-16 space-y-5">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-lg font-bold text-[#1A2E4A]">Document Saved!</p>
            <p className="text-sm text-gray-500 text-center">
              Your document is securely stored in the vault.
            </p>
            <div className="flex gap-3 w-full">
              <FFButton variant="secondary" className="flex-1"
                onClick={() => { setStep('pick'); setSelectedFile(null); setPreviewUrl(null); setDocumentName(''); setTags(''); setExpiryDate(''); setIsEmergencyPriority(false); }}>
                Upload Another
              </FFButton>
              <FFButton className="flex-1" onClick={() => navigate('/vault')}>
                Go to Vault
              </FFButton>
            </div>
          </div>
        )}

        {/* Step: error */}
        {step === 'error' && (
          <div className="flex flex-col items-center justify-center py-16 space-y-5">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-sm font-semibold text-[#1A2E4A]">Upload Failed</p>
            <p className="text-sm text-gray-500 text-center">{errorMsg}</p>
            <FFButton className="w-full" onClick={() => setStep('details')}>Try Again</FFButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentUploadScreen;
