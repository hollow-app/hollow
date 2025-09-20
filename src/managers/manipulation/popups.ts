export function confirmThis(
        pack: { type: string; message: string },
        action: (d: boolean) => void,
) {
        const handleDecision = (d: boolean) => {
                action(d);
        };
        window.hollowManager.emit("Confirm", {
                type: pack.type,
                message: pack.message,
                decision: handleDecision,
        });
}
