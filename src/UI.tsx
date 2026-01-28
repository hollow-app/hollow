import ColorPick from "@components/dynamic/ColorPick";
import FilterButton from "@components/ui/FilterButton";
import { useStore } from "@shared/store";
import {
	Slider,
	Button,
	Tag,
	Input,
	Tooltip,
	Checkbox,
	Combobox,
	Switch,
	FormTrigger,
	Kbd,
	Dropdown,
	DropdownTrigger,
	DropdownContent,
	Pagination,
} from "@ui";
import { createMemo, For } from "solid-js";
import { hollow } from "./hollow";
import { PandaIcon } from "lucide-solid";
import { RadioButton, RadioGroup, RadioGroupItem } from "@ui/RadioGroup";
import { AlertTrigger } from "@ui/AlertTrigger";

export default function UI() {
	const { state, dispatch } = useStore();
	const primary = createMemo(() => state.realm.current.colors.primary);
	const secondary = createMemo(() => state.realm.current.colors.secondary);
	const setPrimary = (c: string) => {
		dispatch({
			domain: "realm",
			type: "update-colors",
			colors: { primary: c },
		});
	};
	const setSecondary = (c: string) => {
		dispatch({
			domain: "realm",
			type: "update-colors",
			colors: { secondary: c },
		});
	};
	const handleClick = async () => {
		await new Promise((resolve) => setTimeout(resolve, 5000));
	};
	const handleDialgue = () => {
		hollow.events.emit("confirm", {
			title: "Are you absolutely sure?",
			message:
				"This action cannot be undone. This will\n permanently delete your account from our servers.",
			onAccept: () => {},
		});
	};
	return (
		<div class="bg-secondary pointer-events-auto absolute inset-0 z-10 space-y-5 p-10">
			<div class="flex gap-5">
				<ColorPick color={primary()} setColor={setPrimary} />
				<ColorPick color={secondary()} setColor={setSecondary} />
			</div>
			<div class="flex flex-wrap gap-5">
				<div class="space-y-5">
					<Button variant="primary" onclick={handleClick}>
						Button
					</Button>
					<Button variant="secondary" onclick={handleClick}>
						Button
					</Button>
					<Button variant="secondary" onclick={handleDialgue}>
						Dialogue
					</Button>
					<Button variant="primary" icon onclick={handleClick}>
						<PandaIcon />
					</Button>
					<Dropdown>
						<DropdownTrigger>
							<Button variant="secondary">Dropdown</Button>
						</DropdownTrigger>
						<DropdownContent placement="bottom">
							<div class="w-30">
								<h1>Hello</h1>
							</div>
						</DropdownContent>
					</Dropdown>
					<RadioGroup>
						<For each={["Option 1", "Option 2", "Option 3"]}>
							{(item) => (
								<RadioGroupItem
									id={item}
									class="border-secondary-10 hover:bg-secondary-05 has-checked:border-primary flex max-w-60 rounded-lg border p-3"
								>
									<div>
										<h1>{item}</h1>
										<span class="text-secondary-50">
											A set of checkable.
										</span>
									</div>
									<RadioButton id={item} class="mt-1" />
								</RadioGroupItem>
							)}
						</For>
					</RadioGroup>
				</div>
				<div class="w-fit space-y-5">
					<Combobox
						items={[
							{
								title: "Example",
								items: ["Apple", "Orange", "Berries", "Banana"],
							},
						]}
						placeholder="Select a fruit"
						onselect={() => {}}
						icon="comet"
						//readonly
					/>
					<div class="flex items-center gap-10">
						<FilterButton
							options={() => [
								{
									title: "Image Type",
									onSelect: () => {},
									isCheckBox: true,
									items: [
										{ label: "jpg" },
										{ label: "png" },
										{ label: "gif" },
									],
								},
							]}
						/>
						<Tooltip
							class="text-xs text-neutral-500"
							content="Informations"
						>
							Example
						</Tooltip>
						<FormTrigger
							id="test"
							title="Edit profile"
							description="Make changes to your profile here. Click save when you're done."
							options={[
								{
									key: "name",
									label: "Name",
									type: "text",
									attributes: {
										icon: "user",
										placeholder: "Full Name",
									},
								},
								{
									key: "username",
									label: "Username",
									type: "text",
								},
							]}
							submit={() => {}}
						>
							<Button variant="primary">Open Form</Button>
						</FormTrigger>
					</div>
					<div class="flex items-center gap-3">
						<For each={["badge", "hollow"]}>
							{(tag) => <Tag tag={tag} />}
						</For>
						<Kbd>Ctrl</Kbd>
					</div>
					<Input placeholder="Search" icon="comet" />
					<div class="flex items-center gap-2 text-neutral-500">
						<Checkbox checked onclick={() => {}} />
						Accept terms of conditions
					</div>
					<div class="border-secondary-10 w-80 rounded-lg border p-3">
						<div class="flex items-center justify-between">
							<span>Share across devices</span>
							<Switch checked onchange={() => {}} />
						</div>
						<span class="text-secondary-50">
							Focus is shared across devices, and turns off when
							you leave the app.
						</span>
					</div>
					<Slider value={50} setValue={() => {}} />
					<Pagination length={100} perPage={20} />
					<AlertTrigger
						type="loading"
						title="New feature available"
						message="We've added dark mode support. You can enable it in your account settings."
						action={async () => {
							await handleClick();
							return {
								type: "success",
								message:
									"We've added dark mode support. You can enable it in your account settings.",
								title: "New feature available!!!",
							};
						}}
					>
						<Button variant="secondary">Alert</Button>
					</AlertTrigger>
				</div>
				<div></div>
			</div>
		</div>
	);
}
