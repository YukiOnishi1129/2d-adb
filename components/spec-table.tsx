import type { Work } from "@/lib/types";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Mic,
  Clock,
  Theater,
  Headphones,
  Image,
  Heart,
  Gamepad2,
  Settings,
} from "lucide-react";

interface SpecTableProps {
  work: Work;
}

interface SpecItem {
  icon: LucideIcon;
  label: string;
  value: string;
}

// genreからASMRかどうか判定
function isASMRByGenre(genre: string | null | undefined, category: string | null | undefined): boolean {
  // genreがある場合はgenreを優先
  if (genre) {
    return genre.includes("音声");
  }
  // genreがない場合のみcategoryにフォールバック
  return category === "ASMR" || category === "音声作品";
}

// genreからゲームかどうか判定
function isGameByGenre(genre: string | null | undefined, category: string | null | undefined): boolean {
  // genreがある場合はgenreを優先
  if (genre) {
    return genre.includes("ゲーム");
  }
  // genreがない場合のみcategoryにフォールバック
  return category === "ゲーム";
}

export function SpecTable({ work }: SpecTableProps) {
  const { killerWords, genre, category } = work;

  // 音声・ASMR作品のスペック（genreを優先）
  if (isASMRByGenre(genre, category)) {
    const specs: SpecItem[] = [
      killerWords.cvNames && {
        icon: Mic,
        label: "CV",
        value: killerWords.cvNames.join("、"),
      },
      killerWords.durationMinutes && {
        icon: Clock,
        label: "収録時間",
        value: `約${killerWords.durationMinutes}分`,
      },
      killerWords.situations && {
        icon: Theater,
        label: "シチュエーション",
        value: killerWords.situations.join("、"),
      },
      killerWords.fetishTags && {
        icon: Headphones,
        label: "録音",
        value: killerWords.fetishTags.join("、"),
      },
    ].filter((item): item is SpecItem => Boolean(item));

    if (specs.length === 0) return null;

    return (
      <Card>
        <CardHeader className="pb-3 bg-linear-to-r from-indigo-50 to-purple-50">
          <CardTitle className="text-sm font-medium text-primary">
            作品スペック
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {specs.map((spec, i) => {
              const Icon = spec.icon;
              return (
                <div key={i} className="flex items-center px-4 py-3">
                  <Icon className="mr-3 h-4 w-4 text-muted-foreground" />
                  <span className="w-28 text-sm text-muted-foreground">
                    {spec.label}
                  </span>
                  <span className="flex-1 text-sm text-foreground">
                    {spec.value}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  // ゲーム作品のスペック（genreを優先）
  if (isGameByGenre(genre, category)) {
    const specs: SpecItem[] = [
      killerWords.cgCount && {
        icon: Image,
        label: "CG枚数",
        value: killerWords.cgDiffCount
          ? `基本${killerWords.cgCount}枚（差分込み${killerWords.cgDiffCount}枚）`
          : `${killerWords.cgCount}枚`,
      },
      killerWords.hSceneCount && {
        icon: Heart,
        label: "Hシーン",
        value: `${killerWords.hSceneCount}シーン`,
      },
      killerWords.playTimeHours && {
        icon: Gamepad2,
        label: "プレイ時間",
        value: `約${killerWords.playTimeHours}時間`,
      },
      killerWords.gameFeatures && {
        icon: Settings,
        label: "便利機能",
        value: killerWords.gameFeatures.join("、"),
      },
    ].filter((item): item is SpecItem => Boolean(item));

    if (specs.length === 0) return null;

    return (
      <Card>
        <CardHeader className="pb-3 bg-linear-to-r from-emerald-50 to-teal-50">
          <CardTitle className="text-sm font-medium text-primary">
            ゲームスペック
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {specs.map((spec, i) => {
              const Icon = spec.icon;
              return (
                <div key={i} className="flex items-center px-4 py-3">
                  <Icon className="mr-3 h-4 w-4 text-muted-foreground" />
                  <span className="w-28 text-sm text-muted-foreground">
                    {spec.label}
                  </span>
                  <span className="flex-1 text-sm text-foreground">
                    {spec.value}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
