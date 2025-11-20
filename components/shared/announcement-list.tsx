import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  createdAt: Date;
  author: { name: string | null };
}

interface AnnouncementListProps {
  announcements: Announcement[];
}

export function AnnouncementList({ announcements }: AnnouncementListProps) {
  if (announcements.length === 0) {
    return <p className="text-sm text-muted-foreground">No announcements</p>;
  }

  return (
    <div className="space-y-4">
      {announcements.map((announcement, index) => (
        <div key={announcement.id}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm">{announcement.title}</h4>
              {announcement.priority === "high" && (
                <Badge variant="destructive" className="text-xs">Important</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{announcement.content}</p>
            <p className="text-xs text-muted-foreground">
              By {announcement.author.name} • {new Date(announcement.createdAt).toLocaleDateString()}
            </p>
          </div>
          {index < announcements.length - 1 && <Separator className="mt-4" />}
        </div>
      ))}
    </div>
  );
}
