import React, { useState, useEffect } from 'react';
import {
  Share2,
  TrendingUp,
  TrendingDown,
  Calendar,
  MessageSquare,
  CheckCircle2,
  Send,
  RefreshCw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useReports } from '../providers/ReportsProvider';
import { ReportsRepository, ReportLookupOption } from '../repositories/ReportsRepository';
import FFCard from '../../../shared/components/FFCard';
import FFButton from '../../../shared/components/FFButton';
import FFBadge from '../../../shared/components/FFBadge';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import FFErrorState from '../../../shared/components/FFErrorState';

const normalizeLookupValue = (value: string) =>
  value.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[^a-z0-9]+/gi, ' ').trim().toLowerCase();

const matchesLookup = (value: string, option: ReportLookupOption) => {
  const normalizedValue = normalizeLookupValue(value);
  const normalizedCode  = normalizeLookupValue(option.code);
  const normalizedLabel = normalizeLookupValue(option.label);
  return normalizedValue.includes(normalizedCode) || normalizedValue.includes(normalizedLabel);
};

const WeeklyDigestScreen: React.FC = () => {
  const navigate = useNavigate();
  const { weeklyDigest, fetchWeeklyDigest, isLoading } = useReports();
  const [remark, setRemark] = useState('');
  const [isSavingRemark, setIsSavingRemark] = useState(false);
  const [taskTypes, setTaskTypes] = useState<ReportLookupOption[]>([]);
  const [eventTypes, setEventTypes] = useState<ReportLookupOption[]>([]);
  const [selectedTaskType, setSelectedTaskType] = useState<string>('All');
  const [selectedEventType, setSelectedEventType] = useState<string>('All');
  const [lookupError, setLookupError] = useState<string | null>(null);

  const loadLookups = async () => {
    setLookupError(null);
    try {
      const [liveTaskTypes, liveEventTypes] = await Promise.all([
        ReportsRepository.getTaskTypes(),
        ReportsRepository.getCalendarEventTypes(),
      ]);
      setTaskTypes(liveTaskTypes);
      setEventTypes(liveEventTypes);
    } catch (error) {
      console.error('Failed to load report filters', error);
      setLookupError('Unable to load report focus filters right now.');
    }
  };

  useEffect(() => {
    const today = new Date();
    const lastSunday = new Date(today.setDate(today.getDate() - today.getDay()));
    fetchWeeklyDigest(lastSunday.toISOString().split('T')[0]);
  }, [fetchWeeklyDigest]);

  useEffect(() => { void loadLookups(); }, []);

  const handleSaveRemark = async (childId: string) => {
    if (!remark) return;
    setIsSavingRemark(true);
    try {
      await ReportsRepository.updateParentRemark(childId, remark);
      setRemark('');
    } catch (error) {
      console.error('Failed to save remark', error);
    } finally {
      setTimeout(() => setIsSavingRemark(false), 500);
    }
  };

  const handleShare = () => {
    // Sharing logic
  };

  if (isLoading || !weeklyDigest) {
    return (
      <div className="min-h-screen bg-bg-cream">
        <FFPageHeader title="Weekly Digest" showBack />
        <div className="px-4 pt-4 space-y-3">
          <FFShimmer className="h-32 rounded-ff" />
          <FFShimmer className="h-48 rounded-ff" />
          <FFShimmer className="h-48 rounded-ff" />
        </div>
      </div>
    );
  }

  const scoreDiff = weeklyDigest.familyScore - weeklyDigest.previousFamilyScore;

  const filteredChildSummaries = weeklyDigest.childSummaries
    .map(child => ({
      ...child,
      highlights:
        selectedTaskType === 'All'
          ? child.highlights
          : child.highlights.filter(h => {
              const selected = taskTypes.find(opt => opt.id === selectedTaskType);
              return selected ? matchesLookup(h, selected) : true;
            }),
    }))
    .filter(child => selectedTaskType === 'All' || child.highlights.length > 0);

  const filteredUpcomingEvents =
    selectedEventType === 'All'
      ? weeklyDigest.upcomingEvents
      : weeklyDigest.upcomingEvents.filter(event => {
          const selected = eventTypes.find(opt => opt.id === selectedEventType);
          return selected ? matchesLookup(event, selected) : true;
        });

  return (
    <div className="min-h-screen bg-bg-cream pb-24">
      <FFPageHeader
        title="Weekly Digest"
        showBack
        rightAction={
          <button onClick={handleShare} className="p-2 rounded-xl bg-white/10" aria-label="Share">
            <Share2 className="w-4 h-4 text-white" />
          </button>
        }
      />

      <div className="px-4 pt-4 space-y-4">
        {/* Family score hero */}
        <FFCard className="bg-primary text-white p-5">
          <p className="font-body text-xs text-white/60 mb-1">Family Score this week</p>
          <div className="flex items-end justify-between">
            <p className="font-numbers text-6xl font-bold text-white leading-none">
              {weeklyDigest.familyScore}
            </p>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-ff ${
              scoreDiff >= 0 ? 'bg-success/20 text-success' : 'bg-alert/20 text-alert'
            }`}>
              {scoreDiff >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="font-numbers text-sm font-bold">{Math.abs(scoreDiff)} pts</span>
            </div>
          </div>
          {weeklyDigest.narrative && (
            <p className="font-body text-sm text-white/80 mt-3 leading-relaxed">
              {weeklyDigest.narrative}
            </p>
          )}
        </FFCard>

        {/* Task focus filter */}
        <div className="space-y-2">
          <p className="font-body text-xs text-gray-400 font-medium">Filter by task type</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTaskType('All')}
              className={`rounded-full px-3 py-1.5 font-body text-xs font-medium transition-colors ${
                selectedTaskType === 'All'
                  ? 'bg-primary text-white'
                  : 'bg-white border border-black/5 text-gray-500'
              }`}
            >
              All Tasks
            </button>
            {taskTypes.map(tt => (
              <button
                key={tt.id}
                onClick={() => setSelectedTaskType(tt.id)}
                className={`rounded-full px-3 py-1.5 font-body text-xs font-medium transition-colors ${
                  selectedTaskType === tt.id
                    ? 'bg-accent text-primary'
                    : 'bg-white border border-black/5 text-gray-500'
                }`}
              >
                {tt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Event focus filter */}
        <div className="space-y-2">
          <p className="font-body text-xs text-gray-400 font-medium">Filter by event type</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedEventType('All')}
              className={`rounded-full px-3 py-1.5 font-body text-xs font-medium transition-colors ${
                selectedEventType === 'All'
                  ? 'bg-primary text-white'
                  : 'bg-white border border-black/5 text-gray-500'
              }`}
            >
              All Events
            </button>
            {eventTypes.map(et => (
              <button
                key={et.id}
                onClick={() => setSelectedEventType(et.id)}
                className={`rounded-full px-3 py-1.5 font-body text-xs font-medium transition-colors ${
                  selectedEventType === et.id
                    ? 'bg-accent text-primary'
                    : 'bg-white border border-black/5 text-gray-500'
                }`}
              >
                {et.label}
              </button>
            ))}
          </div>
        </div>

        {lookupError && (
          <FFErrorState message={lookupError} onRetry={() => void loadLookups()} />
        )}

        {/* Child summaries */}
        <FFSectionHeader title="Highlights" />
        {filteredChildSummaries.length === 0 ? (
          <FFEmptyState
            title="No highlights"
            message="No child highlights match the selected task focus."
          />
        ) : (
          <div className="space-y-4">
            {filteredChildSummaries.map(child => (
              <FFCard key={child.childId} className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-display font-semibold text-base text-primary">{child.childName}</p>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <FFBadge variant="success" size="sm">Attendance: {child.attendance}</FFBadge>
                    <FFBadge variant="accent" size="sm">Homework: {child.homework}</FFBadge>
                  </div>
                </div>

                {child.highlights.length > 0 && (
                  <ul className="space-y-2">
                    {child.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-xl bg-success/10 flex items-center justify-center text-success flex-shrink-0 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-body text-sm text-primary leading-snug">{h}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Parent remark input */}
                <div className="pt-3 border-t border-black/5 space-y-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-gray-300" />
                    <p className="font-body text-xs text-gray-400">Leave a note for {child.childName}</p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Write a note..."
                      className="flex-1 border border-black/5 rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:ring-1 focus:ring-primary/20"
                      value={remark}
                      onChange={e => setRemark(e.target.value)}
                    />
                    <FFButton
                      onClick={() => handleSaveRemark(child.childId)}
                      disabled={!remark || isSavingRemark}
                      icon={isSavingRemark ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    >
                      Send
                    </FFButton>
                  </div>
                </div>
              </FFCard>
            ))}
          </div>
        )}

        {/* Teacher appreciations */}
        {weeklyDigest.teacherAppreciations.length > 0 && (
          <div className="space-y-3">
            <FFSectionHeader title="Teacher Feedback" />
            <FFCard className="p-4 space-y-3">
              {weeklyDigest.teacherAppreciations.map((note, i) => (
                <p key={i} className="font-body text-sm text-primary italic leading-snug border-l-2 border-accent/30 pl-3">
                  "{note}"
                </p>
              ))}
            </FFCard>
          </div>
        )}

        {/* Upcoming events */}
        <div className="space-y-3">
          <FFSectionHeader title="Coming Up" />
          {filteredUpcomingEvents.length === 0 ? (
            <FFEmptyState
              icon={<Calendar className="w-8 h-8 text-gray-300" />}
              title="No upcoming events"
              message={selectedEventType === 'All' ? 'Nothing scheduled this week.' : `No ${selectedEventType} events found.`}
            />
          ) : (
            <FFCard className="divide-y divide-black/5">
              {filteredUpcomingEvents.map((event, i) => (
                <div key={i} className="flex items-center gap-3 py-3 px-4">
                  <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                  <span className="font-body text-sm text-primary">{event}</span>
                </div>
              ))}
            </FFCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklyDigestScreen;
