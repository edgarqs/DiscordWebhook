import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Repeat } from 'lucide-react';

interface SchedulePickerProps {
    scheduleType: 'once' | 'recurring';
    onScheduleTypeChange: (type: 'once' | 'recurring') => void;
    scheduledAt: string;
    onScheduledAtChange: (value: string) => void;
    recurrencePattern: {
        frequency: 'daily' | 'weekly' | 'monthly';
        time: string;
        days: number[];
        day: number;
    };
    onRecurrencePatternChange: (pattern: any) => void;
    timezone: string;
    onTimezoneChange: (tz: string) => void;
    maxSends?: number;
    onMaxSendsChange: (value: number | undefined) => void;
}

const TIMEZONES = [
    'UTC',
    'Europe/Madrid',
    'Europe/London',
    'America/New_York',
    'America/Los_Angeles',
    'Asia/Tokyo',
];

const WEEKDAYS = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
];

export function SchedulePicker({
    scheduleType,
    onScheduleTypeChange,
    scheduledAt,
    onScheduledAtChange,
    recurrencePattern,
    onRecurrencePatternChange,
    timezone,
    onTimezoneChange,
    maxSends,
    onMaxSendsChange,
}: SchedulePickerProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Schedule Configuration
                </CardTitle>
                <CardDescription>
                    Configure when this message should be sent
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Schedule Type */}
                <div className="space-y-2">
                    <Label>Schedule Type</Label>
                    <div className="grid grid-cols-2 gap-4">
                        <label className={`flex items-center gap-2 p-4 border rounded-lg cursor-pointer ${scheduleType === 'once' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                            <input
                                type="radio"
                                name="schedule_type"
                                value="once"
                                checked={scheduleType === 'once'}
                                onChange={() => onScheduleTypeChange('once')}
                                className="rounded-full"
                            />
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span className="font-medium">One-time</span>
                            </div>
                        </label>
                        <label className={`flex items-center gap-2 p-4 border rounded-lg cursor-pointer ${scheduleType === 'recurring' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                            <input
                                type="radio"
                                name="schedule_type"
                                value="recurring"
                                checked={scheduleType === 'recurring'}
                                onChange={() => onScheduleTypeChange('recurring')}
                                className="rounded-full"
                            />
                            <div className="flex items-center gap-2">
                                <Repeat className="h-4 w-4" />
                                <span className="font-medium">Recurring</span>
                            </div>
                        </label>
                    </div>
                </div>

                {/* One-time Schedule */}
                {scheduleType === 'once' && (
                    <div className="space-y-2">
                        <Label htmlFor="scheduled_at">Send Date & Time</Label>
                        <Input
                            id="scheduled_at"
                            type="datetime-local"
                            value={scheduledAt}
                            onChange={(e) => onScheduledAtChange(e.target.value)}
                        />
                    </div>
                )}

                {/* Recurring Schedule */}
                {scheduleType === 'recurring' && (
                    <div className="space-y-4">
                        {/* Frequency */}
                        <div className="space-y-2">
                            <Label htmlFor="frequency">Frequency</Label>
                            <Select
                                value={recurrencePattern.frequency}
                                onValueChange={(v) => onRecurrencePatternChange({ ...recurrencePattern, frequency: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Time */}
                        <div className="space-y-2">
                            <Label htmlFor="time">Time</Label>
                            <Input
                                id="time"
                                type="time"
                                value={recurrencePattern.time}
                                onChange={(e) => onRecurrencePatternChange({ ...recurrencePattern, time: e.target.value })}
                            />
                        </div>

                        {/* Weekly: Days selection */}
                        {recurrencePattern.frequency === 'weekly' && (
                            <div className="space-y-2">
                                <Label>Days of Week</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {WEEKDAYS.map((day) => (
                                        <label key={day.value} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={recurrencePattern.days.includes(day.value)}
                                                onChange={(e) => {
                                                    const newDays = e.target.checked
                                                        ? [...recurrencePattern.days, day.value]
                                                        : recurrencePattern.days.filter(d => d !== day.value);
                                                    onRecurrencePatternChange({ ...recurrencePattern, days: newDays });
                                                }}
                                                className="rounded"
                                            />
                                            <span className="text-sm">{day.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Monthly: Day selection */}
                        {recurrencePattern.frequency === 'monthly' && (
                            <div className="space-y-2">
                                <Label htmlFor="day">Day of Month</Label>
                                <Input
                                    id="day"
                                    type="number"
                                    min="1"
                                    max="31"
                                    value={recurrencePattern.day}
                                    onChange={(e) => onRecurrencePatternChange({ ...recurrencePattern, day: parseInt(e.target.value) })}
                                />
                            </div>
                        )}

                        {/* Max Sends */}
                        <div className="space-y-2">
                            <Label htmlFor="max_sends">Maximum Sends (Optional)</Label>
                            <Input
                                id="max_sends"
                                type="number"
                                min="1"
                                placeholder="Unlimited"
                                value={maxSends || ''}
                                onChange={(e) => onMaxSendsChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                            <p className="text-sm text-muted-foreground">
                                Leave empty for unlimited sends
                            </p>
                        </div>
                    </div>
                )}

                {/* Timezone */}
                <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={timezone} onValueChange={onTimezoneChange}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {TIMEZONES.map((tz) => (
                                <SelectItem key={tz} value={tz}>
                                    {tz}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    );
}
