"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCurrentUser, useUpdateProfile } from "@/app/hooks/auth.hooks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfileSchema } from "@/validations/auth.validation";
import {
  Camera,
  CheckCircle2,
  Code2,
  FileText,
  Globe,
  Loader2,
  Lock,
  Mail,
  Phone,
  Plus,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
  X,
} from "lucide-react";

function getInitials(name?: string) {
  if (!name) return "D";
  const clean = name.replace(/[^\w\s]/gi, "").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

const POPULAR_SKILLS = [
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "PostgreSQL",
  "Docker",
  "Python",
  "Tailwind CSS",
  "GraphQL",
];

export function ProfileSettingsForm() {
  const router = useRouter();
  const { data: userData, isLoading: isUserLoading } = useCurrentUser();
  const updateMutation = useUpdateProfile();

  const rawData = userData?.data as {
    user?: {
      email?: string;
      role?: string;
      developerProfile?: {
        name?: string;
        phone?: string | null;
        avatarUrl?: string | null;
        experienceYears?: number;
        skills?: string[];
        githubUrl?: string | null;
        portfolioUrl?: string | null;
        resumeUrl?: string | null;
      };
    };
    profile?: {
      name?: string;
      phone?: string | null;
      avatarUrl?: string | null;
      experienceYears?: number;
      skills?: string[];
      githubUrl?: string | null;
      portfolioUrl?: string | null;
      resumeUrl?: string | null;
    };
    email?: string;
    developerProfile?: {
      name?: string;
      phone?: string | null;
      avatarUrl?: string | null;
      experienceYears?: number;
      skills?: string[];
      githubUrl?: string | null;
      portfolioUrl?: string | null;
      resumeUrl?: string | null;
    };
  } | null;

  const currentUser = rawData?.user || rawData;
  const devProfile = rawData?.profile || currentUser?.developerProfile;

  // Form State
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [experienceYears, setExperienceYears] = React.useState<number | string>(
    0,
  );
  const [skills, setSkills] = React.useState<string[]>([]);
  const [skillInput, setSkillInput] = React.useState("");
  const [githubUrl, setGithubUrl] = React.useState("");
  const [portfolioUrl, setPortfolioUrl] = React.useState("");
  const [resumeUrl, setResumeUrl] = React.useState("");

  // Avatar / Photo State
  const [selectedImage, setSelectedImage] = React.useState<File | null>(null);
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Validation Errors
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});

  // Populate data when loaded
  React.useEffect(() => {
    if (devProfile || currentUser) {
      setName(devProfile?.name || "");
      setPhone(devProfile?.phone || "");
      setExperienceYears(devProfile?.experienceYears ?? 0);
      setSkills(devProfile?.skills || []);
      setGithubUrl(devProfile?.githubUrl || "");
      setPortfolioUrl(devProfile?.portfolioUrl || "");
      setResumeUrl(devProfile?.resumeUrl || "");
      if (devProfile?.avatarUrl) {
        setPreviewImage(devProfile.avatarUrl);
      }
    }
  }, [devProfile, currentUser]);

  // Profile completion score calculation
  const completionScore = React.useMemo(() => {
    let score = 20; // Email is verified
    if (name.trim().length >= 2) score += 15;
    if (phone.trim()) score += 15;
    if (skills.length > 0) score += 20;
    if (Number(experienceYears) > 0) score += 10;
    if (githubUrl.trim()) score += 10;
    if (portfolioUrl.trim() || resumeUrl.trim()) score += 10;
    return Math.min(score, 100);
  }, [
    name,
    phone,
    skills,
    experienceYears,
    githubUrl,
    portfolioUrl,
    resumeUrl,
  ]);

  // Image Upload Handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File too large", {
          description: "Profile photo must be less than 5MB.",
        });
        return;
      }
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Skill Tags Management
  const handleAddSkill = (skillToAdd: string) => {
    const trimmed = skillToAdd.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddSkill(skillInput);
    }
  };

  // Reset to original values
  const handleReset = () => {
    if (devProfile) {
      setName(devProfile?.name || "");
      setPhone(devProfile?.phone || "");
      setExperienceYears(devProfile?.experienceYears ?? 0);
      setSkills(devProfile?.skills || []);
      setGithubUrl(devProfile?.githubUrl || "");
      setPortfolioUrl(devProfile?.portfolioUrl || "");
      setResumeUrl(devProfile?.resumeUrl || "");
      setPreviewImage(devProfile?.avatarUrl || null);
      setSelectedImage(null);
      setErrors({});
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = updateProfileSchema.safeParse({
      name,
      phone: phone || undefined,
      experienceYears: Number(experienceYears),
      skills,
      githubUrl: githubUrl || undefined,
      portfolioUrl: portfolioUrl || undefined,
      resumeUrl: resumeUrl || undefined,
    });

    if (!validation.success) {
      const fieldErrors: { [key: string]: string } = {};
      for (const issue of validation.error.issues) {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      }
      setErrors(fieldErrors);
      toast.error("Validation Error", {
        description: "Please check the form fields for errors.",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", validation.data.name);
      if (validation.data.phone) {
        formData.append("phone", validation.data.phone);
      }
      formData.append(
        "experienceYears",
        String(validation.data.experienceYears ?? 0),
      );
      if (skills.length > 0) {
        formData.append("skills", skills.join(","));
      }
      if (validation.data.githubUrl) {
        formData.append("githubUrl", validation.data.githubUrl);
      }
      if (validation.data.portfolioUrl) {
        formData.append("portfolioUrl", validation.data.portfolioUrl);
      }
      if (validation.data.resumeUrl) {
        formData.append("resumeUrl", validation.data.resumeUrl);
      }
      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      await updateMutation.mutateAsync(formData);

      toast.success("Profile Updated!", {
        description:
          "Your developer profile and workspace details have been saved successfully.",
      });
    } catch (err: unknown) {
      const errorResponse = err as {
        response?: { _data?: { message?: string } };
        data?: { message?: string };
        message?: string;
      };
      const msg =
        errorResponse?.response?._data?.message ||
        errorResponse?.data?.message ||
        errorResponse?.message ||
        "Failed to update profile. Please try again.";

      toast.error("Update Failed", { description: msg });
      setErrors({ form: msg });
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground font-medium">
            Loading developer profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Profile Summary Header Card */}
      <Card className="border-border/70 bg-card/80 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 size-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
            {/* Avatar & Photo Picker */}
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Avatar className="size-20 rounded-2xl border-2 border-primary/30 bg-primary/10 text-primary shadow-md overflow-hidden">
                  <AvatarImage
                    src={previewImage || undefined}
                    alt={name || "Developer"}
                    className="size-20 rounded-2xl object-cover"
                  />
                  <AvatarFallback className="size-20 rounded-2xl bg-primary/15 text-primary text-2xl font-bold uppercase tracking-wider">
                    {getInitials(name || currentUser?.email || "D")}
                  </AvatarFallback>
                </Avatar>

                {/* Hover Camera Overlay */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs cursor-pointer"
                  title="Upload profile picture"
                >
                  <Camera className="size-5" />
                  <span className="text-[9px] font-semibold mt-1">Change</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight">
                    {name || "Developer Profile"}
                  </h2>
                  <Badge className="bg-primary/15 text-primary border-primary/25 text-[10px] py-0 px-2 font-semibold">
                    <ShieldCheck className="size-3 mr-1 text-emerald-500" />
                    Verified Developer
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {currentUser?.email}
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px] px-2.5 font-medium gap-1"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="size-3" />
                    Upload Photo
                  </Button>
                  {previewImage && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[11px] px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={handleRemoveImage}
                    >
                      <Trash2 className="size-3 mr-1" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Completion Meter */}
            <div className="w-full sm:w-56 rounded-xl border border-border/70 bg-background/50 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-primary" />
                  Profile Score
                </span>
                <span className="font-bold text-primary font-mono">
                  {completionScore}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${completionScore}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                {completionScore >= 90
                  ? "Outstanding! Profile is complete."
                  : "Add skills and portfolio to reach 100%."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Global Form Error Banner */}
      {errors.form && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2 font-medium">
          <span>{errors.form}</span>
        </div>
      )}

      {/* Main Settings Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Personal & Identity Info */}
        <Card className="border-border/70 bg-card/80 backdrop-blur-xl shadow-xl">
          <CardHeader className="pb-3 space-y-1">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <User className="size-4 text-primary" />
              Personal & Contact Details
            </CardTitle>
            <CardDescription className="text-xs">
              Primary identification credentials for code screening and
              recruitment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="profile-name" required>
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="profile-name"
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9"
                  error={!!errors.name}
                  required
                />
              </div>
              {errors.name && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email (Read Only) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="profile-email">Registered Email</Label>
                <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="size-3" />
                  Primary ID
                </span>
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="profile-email"
                  value={currentUser?.email || ""}
                  disabled
                  className="pl-9 bg-muted/50 cursor-not-allowed opacity-80"
                />
                <Lock className="absolute right-3 top-2.5 size-3.5 text-muted-foreground" />
              </div>
              <p className="text-[10px] text-muted-foreground">
                Email is tied to your developer assessments and cannot be
                changed directly.
              </p>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="profile-phone">Contact Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="profile-phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-9"
                  error={!!errors.phone}
                />
              </div>
              {errors.phone && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.phone}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Professional Experience & Career */}
        <Card className="border-border/70 bg-card/80 backdrop-blur-xl shadow-xl">
          <CardHeader className="pb-3 space-y-1">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Code2 className="size-4 text-primary" />
              Technical Background
            </CardTitle>
            <CardDescription className="text-xs">
              Highlight your engineering depth for automated role-matching
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {/* Experience Years */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="profile-exp">Years of Experience</Label>
                <Badge
                  variant="outline"
                  className="text-xs font-mono font-bold"
                >
                  {experienceYears}{" "}
                  {Number(experienceYears) === 1 ? "Year" : "Years"}
                </Badge>
              </div>
              <Input
                id="profile-exp"
                type="number"
                min="0"
                max="50"
                placeholder="5"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                error={!!errors.experienceYears}
              />
              {errors.experienceYears && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.experienceYears}
                </p>
              )}
            </div>

            {/* Resume / CV Link */}
            <div className="space-y-1.5">
              <Label htmlFor="profile-resume">Resume / CV Link</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="profile-resume"
                  placeholder="https://drive.google.com/... or cloud PDF URL"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  className="pl-9"
                  error={!!errors.resumeUrl}
                />
              </div>
              {errors.resumeUrl && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.resumeUrl}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Interactive Skills & Tech Stack (Full Width) */}
        <Card className="border-border/70 bg-card/80 backdrop-blur-xl shadow-xl md:col-span-2">
          <CardHeader className="pb-3 space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                Skills & Tech Stack Tags
              </CardTitle>
              <span className="text-xs text-muted-foreground">
                {skills.length} Selected
              </span>
            </div>
            <CardDescription className="text-xs">
              Type and press{" "}
              <kbd className="rounded border px-1 text-[10px]">Enter</kbd> or
              click popular suggestions below to add tech skills
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {/* Input to add skills */}
            <div className="flex gap-2">
              <Input
                placeholder="Type a skill (e.g. Next.js, Go, Docker) and press Enter..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => handleAddSkill(skillInput)}
                disabled={!skillInput.trim()}
                className="gap-1.5"
              >
                <Plus className="size-4" />
                Add
              </Button>
            </div>

            {/* Active Skill Pill Badges */}
            <div className="flex flex-wrap gap-2 min-h-12 p-3 rounded-xl border border-border/60 bg-background/50 items-center">
              {skills.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  No skills added yet. Add your core languages and frameworks
                  above.
                </p>
              ) : (
                skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary/15 text-primary border border-primary/25 px-2.5 py-1 text-xs font-semibold shadow-xs transition-all hover:bg-primary/20"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="rounded-full hover:bg-primary/30 p-0.5 text-primary transition-colors cursor-pointer"
                      title={`Remove ${skill}`}
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Popular Skills Quick Add Suggestions */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground">
                Suggested Quick Add:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SKILLS.map((item) => {
                  const isAdded = skills.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() =>
                        isAdded ? handleRemoveSkill(item) : handleAddSkill(item)
                      }
                      className={`text-[10px] px-2 py-1 rounded-md border font-medium transition-all cursor-pointer ${
                        isAdded
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/70 text-muted-foreground border-border/50 hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {isAdded ? `✓ ${item}` : `+ ${item}`}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Web Presence & Portfolio Links (Full Width) */}
        <Card className="border-border/70 bg-card/80 backdrop-blur-xl shadow-xl md:col-span-2">
          <CardHeader className="pb-3 space-y-1">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Globe className="size-4 text-primary" />
              Public Profiles & Portfolio
            </CardTitle>
            <CardDescription className="text-xs">
              Direct recruiters and evaluators to your code repositories and
              live applications
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* GitHub URL */}
            <div className="space-y-1.5">
              <Label htmlFor="profile-github">GitHub Profile URL</Label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-2.5 size-4 text-muted-foreground fill-current"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
                <Input
                  id="profile-github"
                  placeholder="https://github.com/username"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="pl-9"
                  error={!!errors.githubUrl}
                />
              </div>
              {errors.githubUrl && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.githubUrl}
                </p>
              )}
            </div>

            {/* Portfolio URL */}
            <div className="space-y-1.5">
              <Label htmlFor="profile-portfolio">
                Personal Portfolio / Website
              </Label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="profile-portfolio"
                  placeholder="https://yourname.dev"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  className="pl-9"
                  error={!!errors.portfolioUrl}
                />
              </div>
              {errors.portfolioUrl && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.portfolioUrl}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-4 z-30 rounded-2xl border border-border/80 bg-background/80 backdrop-blur-xl p-4 shadow-2xl flex items-center justify-between">
        <Link href="/candidate/dashboard">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs font-semibold"
          >
            ← Back to Dashboard
          </Button>
        </Link>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={updateMutation.isPending}
            className="text-xs font-semibold gap-1.5"
          >
            <RotateCcw className="size-3.5" />
            Discard Changes
          </Button>

          <Button
            type="submit"
            size="sm"
            disabled={updateMutation.isPending}
            className="text-xs font-semibold shadow-md shadow-primary/20 gap-1.5 min-w-32"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="size-3.5" />
                Save Profile Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
