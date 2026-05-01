import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RatingInput } from "@/components/ui/rating-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { YearInput } from "@/components/ui/year-input";
import { Disc, ImagePlus, Loader2 } from "lucide-react";
import { Controller, type UseFormReturn } from "react-hook-form";

export function AlbumFormSidebar({
  form,
  coverPreviewUrl,
  loadingCover,
}: {
  form: UseFormReturn<any>;
  coverPreviewUrl?: string | null;
  loadingCover?: boolean;
}) {
  return (
    <>
      <div className="aspect-square w-full rounded-xl overflow-hidden border bg-background shadow-sm relative group">
        {loadingCover ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : coverPreviewUrl ? (
          <img
            src={coverPreviewUrl}
            alt="Album cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/50">
            <Disc className="w-16 h-16 opacity-20" />
            <span className="text-xs mt-2 font-medium opacity-50">
              No Cover
            </span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <Field>
          <FieldLabel className="text-xs uppercase tracking-wider text-muted-foreground">
            Cover Image URL
          </FieldLabel>
          <div className="relative">
            <ImagePlus className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              {...form.register("coverUrl")}
              placeholder="Paste image URL..."
              className="pl-9 bg-background"
            />
          </div>
          <FieldError errors={[form.formState.errors.coverUrl]} />
        </Field>

        <div className="p-4 rounded-lg bg-background border space-y-3">
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel className="text-xs font-medium">
                Archived
              </FieldLabel>
              <Controller
                control={form.control}
                name="isArchived"
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Hidden from default library views
            </p>
          </Field>
        </div>
      </div>
    </>
  );
}

export function AlbumFormDetails({ form }: { form: UseFormReturn<any> }) {
  const watchAcquisition = form.watch("acquisition");

  return (
    <div className="space-y-8">
      {/* Primary Info */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Input
            {...form.register("title")}
            className="text-2xl font-bold border-0 px-3 py-2 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/50"
            placeholder="Album Title"
          />
          <Input
            {...form.register("artist")}
            className="text-lg font-medium text-muted-foreground border-0 px-3 py-2 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/50"
            placeholder="Artist Name"
          />
        </div>
        <div className="h-px bg-border/50 w-full" />
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 gap-6">
        <Field>
          <FieldLabel>Release Year</FieldLabel>
          <Controller
            control={form.control}
            name="releaseYear"
            render={({ field }) => (
              <YearInput
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <FieldError errors={[form.formState.errors.releaseYear]} />
        </Field>

        <Field>
          <FieldLabel>Acquisition Status</FieldLabel>
          <Controller
            control={form.control}
            name="acquisition"
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wishlist">Wishlist</SelectItem>
                  <SelectItem value="library">Library (Owned)</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[form.formState.errors.acquisition]} />
        </Field>

        {watchAcquisition === "library" && (
          <Field>
            <FieldLabel>Listening Progress</FieldLabel>
            <Controller
              control={form.control}
              name="progress"
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || "backlog"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select progress" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="backlog">
                      Backlog (Not Started)
                    </SelectItem>
                    <SelectItem value="active">Active (Listening)</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[form.formState.errors.progress]} />
          </Field>
        )}
      </div>

      <Field>
        <div className="flex items-center justify-between mb-2">
          <FieldLabel className="mb-0">Personal Rating</FieldLabel>
        </div>
        <Controller
          control={form.control}
          name="rating"
          render={({ field }) => (
            <RatingInput value={field.value} onChange={field.onChange} />
          )}
        />
        <FieldError errors={[form.formState.errors.rating]} />
      </Field>

      {/* Additional Details */}
      <div className="space-y-4">
        <Field>
          <FieldLabel>Notes</FieldLabel>
          <Textarea
            {...form.register("notes")}
            className="min-h-[100px] resize-none bg-muted/10"
            placeholder="Add personal notes, review, or thoughts..."
          />
          <FieldError errors={[form.formState.errors.notes]} />
        </Field>

        <Field>
          <FieldLabel>RYM Link</FieldLabel>
          <Input
            {...form.register("rymLink")}
            placeholder="https://rateyourmusic.com/..."
            className="font-mono text-xs"
          />
          <FieldError errors={[form.formState.errors.rymLink]} />
        </Field>
      </div>
    </div>
  );
}
