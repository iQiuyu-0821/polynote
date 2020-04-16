import {StateHandler} from "./state_handler";
import {KernelReport, PosRange, Result, ServerErrorWithCause} from "../../../data/result";
import {CompletionCandidate, Presence, Signatures} from "../../../data/messages";
import {CellComment, CellMetadata, NotebookCell, NotebookConfig} from "../../../data/data";
import {KernelState} from "./kernel_state";
import {EditBuffer} from "../../../data/edit_buffer";
import {ContentEdit} from "../../../data/content_edit";

export interface CellState {
    id: number,
    language: string,
    content: string,
    results: Result[],
    metadata: CellMetadata,
    comments: Record<string, CellComment>,
    // ephemeral states
    pendingEdits: ContentEdit[],
    // TODO: Cell running state is never set. Maybe the server should send a message when a cell starts running?
    //       Currently we piggyback off Tasks but that seems not great.
    selected?: boolean,
    error?: boolean,
    running?: boolean
    queued?: boolean,
    currentSelection?: PosRange,
    currentHighlight?: PosRange,
}

export type CompletionHint = { cell: number, offset: number; completions: CompletionCandidate[] }
export type SignatureHint = { cell: number, offset: number, signatures?: Signatures };

export interface NotebookState {
    // basic states
    path: string,
    cells: CellState[], // this is the canonical ordering of the cells.
    config: NotebookConfig,
    errors: ServerErrorWithCause[],
    // TODO: pretty much everything needs to observe the kernel state to determine whether it should be disabled.
    kernel: KernelState, // TODO move kernel state to this file
    // version
    // TODO: make sure the global and local versions are properly updated
    globalVersion: number,
    localVersion: number,
    editBuffer: EditBuffer,
    // ephemeral states
    activeCompletion?: { resolve: (completion: CompletionHint) => void, reject: () => void },
    activeSignature?: { resolve: (signature: SignatureHint) => void, reject: () => void },
    activePresence: Record<number, { presence: Presence, selection?: { cell: number, range: PosRange}}>
}

export class NotebookStateHandler extends StateHandler<NotebookState> {
    constructor(state: NotebookState) {
        super(state);
    }
}
