import { icons, type LucideProps } from "lucide-solid";
import { Dynamic } from "solid-js/web";

interface IconProps extends LucideProps {
        name: string;
        title?: string;
}

const Icon = (props: IconProps) => {
        return (
                <Dynamic
                        component={
                                icons[props.name as keyof typeof icons] ||
                                icons["Orbit"]
                        }
                        {...props}
                />
        );
};

export default Icon;
