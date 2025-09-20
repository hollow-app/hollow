import { ProfileData } from "./ProfileMain";

export const exampleProfileData: ProfileData = {
        name: "John Doe",
        bio: "Full-stack developer passionate about building great user experiences",
        img: "https://avatars.githubusercontent.com/u/1234567",
        status: "available",
        meta: [
                {
                        id: "location",
                        icon: "MapPin",
                        label: "Location",
                        value: "Asutnr",
                },
                {
                        id: "company",
                        icon: "Building2",
                        label: "Start-up",
                        value: "Hollow",
                },
                {
                        id: "github",
                        icon: "Github",
                        label: "Github",
                        value: "@Ryusufe",
                },
                {
                        id: "skills",
                        icon: "BookKey",
                        label: "Skills",
                        value: [":q", "undefined", "Esc"],
                },
                {
                        id: "experience",
                        icon: "Clock",
                        label: "Experience",
                        value: "Math.random()",
                },
                {
                        id: "languages",
                        icon: "Globe2",
                        label: "Languages",
                        value: ["English", "Sudo-ism"],
                },
                {
                        id: "timezone",
                        icon: "Clock",
                        label: "Timezone",
                        value: "PST",
                },
                {
                        id: "projects",
                        icon: "FolderGit2",
                        label: "Projects",
                        value: 3,
                },
                {
                        id: "contributions",
                        icon: "GitCommitHorizontal",
                        label: "Contributions",
                        value: 0,
                },
        ],
};
