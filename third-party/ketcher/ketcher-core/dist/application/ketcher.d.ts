import { Subscription } from 'subscription';
import type { MoleculeCanvasApi } from 'molecule-contracts';
import { type FormatterFactory } from './formatters';
import type { GenerateImageOptions, StructService, CalculateData, CalculateResult } from '../domain/services';
import { type Editor, MoleculeEditPlanExecutor, type MoleculeEditPlanPlaybackOptions } from './editor';
import { Indigo } from './indigo';
import type { MolfileFormat } from '../domain/serializers/mol/mol.types';
import { Struct } from '../domain/entities/struct';
import { EventEmitter } from 'events';
import { type LogSettings } from '../utilities';
import { type ExportImageParams, type KetcherApiSettings, type SupportedImageFormats, type SupportedModes, type UpdateMonomersLibraryParams } from './ketcher.types';
import type { ISettingsService } from './settings';
import type { MoleculeEditPlanV1, MoleculeRecognitionAdapter } from './recognition';
import { type CalculationSnapshotV1, type CreateCalculationSnapshotV1Options } from '../domain/entities/calculation/calculationSnapshot';
import type { CalculationReadinessResult } from '../domain/services/calculation/readiness.types';
type SetMoleculeOptions = {
    position?: {
        x: number;
        y: number;
    };
    needZoom?: boolean;
    preserveCanvasPosition?: boolean;
};
declare const allowedApiSettings: readonly [readonly ["general.dearomatize-on-load", "dearomatize-on-load"], readonly ["ignoreChiralFlag", "ignoreChiralFlag"], readonly ["disableQueryElements", "disableQueryElements"], readonly ["bondThickness", "bondThickness"]];
type AllowedApiSetting = typeof allowedApiSettings[number][0];
type KetcherGetSettingsResult = Partial<Record<AllowedApiSetting, KetcherApiSettings[AllowedApiSetting]>>;
export declare class Ketcher {
    #private;
    _id: string;
    logging: LogSettings;
    structService: StructService;
    _indigo: Indigo;
    changeEvent: Subscription;
    libraryUpdateEvent: Subscription;
    get editor(): Editor;
    get eventBus(): EventEmitter;
    /** Committed micro-canvas API, with editing capabilities supplied by the host. */
    get molecule(): MoleculeCanvasApi | null;
    get moleculeCanvasUnavailableReason(): string | null;
    /** The host keeps reads unavailable until a mode conversion has finished. */
    setMoleculeCanvasUnavailableReason(reason: string | null): void;
    /** Host injection keeps Ketcher independent of the canvas adapter package. */
    setMoleculeReader(reader: MoleculeCanvasApi | null, dispose?: () => void): void;
    /**
     * Get settings service for managing application settings
     * Returns undefined if settings service was not provided during construction
     */
    get settingsService(): ISettingsService | undefined;
    constructor(structService: StructService, formatterFactory: FormatterFactory, settingsService?: ISettingsService);
    get id(): string;
    get formatterFactory(): FormatterFactory;
    get indigo(): Indigo;
    get settings(): KetcherGetSettingsResult;
    addEditor(editor: Editor): void;
    /**
     * Overrides the default Imago recognition provider for this Ketcher instance.
     * Pass null or omit the adapter to restore the default provider.
     */
    setRecognitionAdapter(adapter?: MoleculeRecognitionAdapter | null): void;
    setSettings(settings: KetcherApiSettings): void;
    getSmiles(isExtended?: boolean): Promise<string>;
    getExtendedSmiles(): Promise<string>;
    getMolfile(molfileFormat?: MolfileFormat): Promise<string>;
    getMol2(): Promise<string>;
    getXYZ(): Promise<string>;
    getExtendedXYZ(): Promise<string>;
    getQCSchema(): Promise<string>;
    getIdt(): Promise<string>;
    getAxoLabs(): Promise<string>;
    getRxn(molfileFormat?: MolfileFormat): Promise<string>;
    getKet(): Promise<string>;
    getFasta(): Promise<string>;
    getSequence(format?: '1-letter' | '3-letter'): Promise<string>;
    getSmarts(): Promise<string>;
    getCml(): Promise<string>;
    getSdf(molfileFormat?: MolfileFormat): Promise<string>;
    getRdf(molfileFormat?: MolfileFormat): Promise<string>;
    getCDXml(): Promise<string>;
    getCDX(): Promise<string>;
    getInchi(withAuxInfo?: boolean): Promise<string>;
    getInChIKey(): Promise<string>;
    containsReaction(): boolean;
    isQueryStructureSelected(): boolean;
    setMolecule(structStr: string, options?: SetMoleculeOptions): Promise<void | undefined>;
    setHelm(helmStr: string): Promise<void | undefined>;
    addFragment(structStr: string, options?: SetMoleculeOptions): Promise<void | undefined>;
    circularLayoutMonomers(): Promise<void>;
    layout(): Promise<void>;
    aromatize(): Promise<void>;
    dearomatize(): Promise<void>;
    calculate(options?: CalculateData): Promise<CalculateResult>;
    getCalculationSnapshot(options?: CreateCalculationSnapshotV1Options): CalculationSnapshotV1;
    checkCalculationReadiness(options?: CreateCalculationSnapshotV1Options): CalculationReadinessResult;
    setCalculationSettings(settings: {
        totalCharge: number;
        multiplicity: number | null;
    }): void;
    /**
     * @param {number} value - in a range [ZoomTool.instance.MINZOOMSCALE, ZoomTool.instance.MAXZOOMSCALE]
     */
    setZoom(value: number): void;
    setMode(mode: SupportedModes): void;
    exportImage(format: SupportedImageFormats, params?: ExportImageParams): void;
    recognize(image: Blob, version?: string): Promise<Struct>;
    playMoleculeEditPlan(plan: MoleculeEditPlanV1, options?: MoleculeEditPlanPlaybackOptions): Promise<MoleculeEditPlanExecutor>;
    generateImage(data: string, options?: GenerateImageOptions): Promise<Blob>;
    reinitializeIndigo(structService: StructService): void;
    sendCustomAction(name: string): void;
    /**
     * Converts raw monomer data to KET format before it is sent to the editor.
     *
     * @throws {Error} When conversion fails or the server rejects the payload.
     *   The thrown message is prefixed with
     *   "Monomer item could not be loaded because of an error: ".
     */
    ensureMonomersLibraryDataInKetFormat(rawMonomersData: string | JSON, params?: UpdateMonomersLibraryParams): Promise<string>;
    ensureMonomersLibraryDataInSdfFormat(rawMonomersData: string | JSON, params?: UpdateMonomersLibraryParams): Promise<string>;
    updateMonomersLibrary(rawMonomersData: string | JSON, params?: UpdateMonomersLibraryParams): Promise<void>;
    replaceMonomersLibrary(rawMonomersData: string | JSON, params?: UpdateMonomersLibraryParams): Promise<void>;
    switchToMacromoleculesMode(): void;
    switchToMoleculesMode(): void;
}
export {};
