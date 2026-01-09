import { MagicMoverState } from '../enums';

/**
 * State transition type definition
 */
type StateTransition = {
    from: MagicMoverState;
    to: MagicMoverState;
    action: string;
};

/**
 * Magic Mover State Machine
 * Defines and validates allowed state transitions
 */
export class MagicMoverStateMachine {
    /**
     * Allowed state transitions
     */
    private static readonly TRANSITIONS: StateTransition[] = [
        { from: MagicMoverState.RESTING, to: MagicMoverState.LOADING, action: 'load' },
        { from: MagicMoverState.LOADING, to: MagicMoverState.LOADING, action: 'load' }, // Can load more items
        { from: MagicMoverState.LOADING, to: MagicMoverState.ON_MISSION, action: 'start_mission' },
        { from: MagicMoverState.LOADING, to: MagicMoverState.RESTING, action: 'unload' },
        { from: MagicMoverState.ON_MISSION, to: MagicMoverState.RESTING, action: 'end_mission' },
    ];

    /**
     * Validate if a state transition is allowed
     * @param currentState - Current state of the mover
     * @param targetState - Target state to transition to
     * @param action - The action triggering the transition
     * @returns true if transition is allowed, false otherwise
     */
    static canTransition(
        currentState: MagicMoverState,
        targetState: MagicMoverState,
        action: string
    ): boolean {
        return this.TRANSITIONS.some(
            (transition) =>
                transition.from === currentState &&
                transition.to === targetState &&
                transition.action === action
        );
    }

    /**
     * Validate transition and throw error if not allowed
     * @param currentState - Current state of the mover
     * @param targetState - Target state to transition to
     * @param action - The action triggering the transition
     * @throws Error if transition is not allowed
     */
    static validateTransition(
        currentState: MagicMoverState,
        targetState: MagicMoverState,
        action: string
    ): void {
        if (!this.canTransition(currentState, targetState, action)) {
            throw new Error(
                `Invalid state transition: Cannot ${action} from ${currentState} to ${targetState}`
            );
        }
    }

    /**
     * Get all allowed transitions from a given state
     * @param currentState - Current state to check from
     * @returns Array of allowed transitions
     */
    static getAllowedTransitions(currentState: MagicMoverState): StateTransition[] {
        return this.TRANSITIONS.filter((transition) => transition.from === currentState);
    }

    /**
     * Get the target state for a specific action from current state
     * @param currentState - Current state
     * @param action - Action to perform
     * @returns Target state if transition exists, null otherwise
     */
    static getTargetState(
        currentState: MagicMoverState,
        action: string
    ): MagicMoverState | null {
        const transition = this.TRANSITIONS.find(
            (t) => t.from === currentState && t.action === action
        );
        return transition ? transition.to : null;
    }
}

