import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  type EditorProps,
  MicromoleculesEditor as MicromoleculesEditorComponent,
} from './MicromoleculesEditor';
import { ModeControl } from './ui/toolbars/ModeControl';
import { LoadingCircles } from './ui/components';
import styles from './Editor.module.less';
import {
  type Ketcher,
  type Editor as MoleculesEditor,
  type CoreEditor,
  ketcherProvider,
} from 'ketcher-core';
import { Icon } from './components/Icon';
import { IconButton } from './components/Buttons/IconButton';
import { Button } from './components/Buttons/Button';
import { Input } from './components/Input';
import { Accordion } from './components/Accordion';
import { ArrowScroll } from './ui/toolbars/ArrowScroll';
import { StructRender } from './components/StructRender';
import { AmbiguousMonomerPreview } from './components/MonomerPreview/AmbiguousMonomerPreview/AmbiguousMonomerPreview';
import { usePortalStyle } from './ui/toolbars/ToolbarGroupItem/ToolbarMultiToolItem/usePortalStyle';
import { getFullscreenElement } from './utils';
import type { MacromoleculesUIComponents } from 'ketcher-macromolecules';

type Props = Omit<EditorProps, 'ketcherId'> & {
  disableMacromoleculesEditor?: boolean;
  monomersLibraryUpdate?: string | JSON;
  monomersLibraryReplace?: string | JSON;
};

// Build macromolecules first for its public types; load its UI on demand.
const MacromoleculesEditorComponent = lazy(
  () => import('ketcher-macromolecules'),
);

const macromoleculesUI: MacromoleculesUIComponents = {
  Icon,
  IconButton,
  Button,
  Input,
  Accordion,
  ArrowScroll,
  StructRender,
  AmbiguousMonomerPreview,
  usePortalStyle,
  getFullscreenElement,
};

export const Editor = (props: Props) => {
  const [showPolymerEditor, setShowPolymerEditor] = useState(false);
  const polymerModeRef = useRef(false);
  const [moleculesEditor, setMoleculesEditor] = useState<MoleculesEditor>();
  const [ketcher, setKetcher] = useState<Ketcher>();
  // The small-editor bootstrap retains its initial mode-control element.
  // Its callback must resolve the initialized instance when it is invoked.
  const ketcherRef = useRef<Ketcher | null>(null);
  const [macromoleculesEditor, setMacromoleculesEditor] =
    useState<CoreEditor>();

  const [ketcherId, setKetcherId] = useState<string>('');
  const togglePolymerEditor = useCallback((toggleValue: boolean) => {
    if (polymerModeRef.current === toggleValue) return;
    polymerModeRef.current = toggleValue;
    ketcherRef.current?.setMoleculeCanvasUnavailableReason(
      toggleValue
        ? 'Only the micromolecule canvas is supported.'
        : 'The canvas is being converted to micromolecule mode.',
    );
    setShowPolymerEditor(toggleValue);
    window.isPolymerEditorTurnedOn = toggleValue;
  }, []);

  const togglerComponent = !props.disableMacromoleculesEditor ? (
    <ModeControl
      toggle={togglePolymerEditor}
      isPolymerEditor={showPolymerEditor}
    />
  ) : undefined;

  useEffect(() => {
    const switchToMacromoleculesModeHandler = () => {
      togglePolymerEditor(true);
    };
    const switchToMoleculesModeHandler = () => {
      togglePolymerEditor(false);
    };

    if (macromoleculesEditor) {
      macromoleculesEditor.events.switchToMacromoleculesMode.add(
        switchToMacromoleculesModeHandler,
      );
      macromoleculesEditor.events.switchToMoleculesMode.add(
        switchToMoleculesModeHandler,
      );
    }

    return () => {
      if (macromoleculesEditor) {
        macromoleculesEditor.events.switchToMacromoleculesMode.remove(
          switchToMacromoleculesModeHandler,
        );
        macromoleculesEditor.events.switchToMoleculesMode.remove(
          switchToMoleculesModeHandler,
        );
      }
    };
  }, [macromoleculesEditor, togglePolymerEditor]);

  useEffect(() => {
    return () => {
      window.isPolymerEditorTurnedOn = false;
    };
  }, []);

  useEffect(() => {
    if (moleculesEditor && macromoleculesEditor) {
      if (showPolymerEditor) {
        moleculesEditor?.closeMonomerCreationWizard?.(true);
        macromoleculesEditor?.switchToMacromolecules();
      } else {
        macromoleculesEditor?.switchToMicromolecules();
        ketcher?.setMoleculeCanvasUnavailableReason(null);
        moleculesEditor?.focusCliparea();
      }
    }
  }, [showPolymerEditor]);

  useEffect(() => {
    if (
      ketcher &&
      moleculesEditor &&
      (macromoleculesEditor || props.disableMacromoleculesEditor)
    ) {
      if (ketcherProvider.getIndexById(ketcher.id) !== -1) {
        props.onInit?.(ketcher);
      }
    }
  }, [moleculesEditor, macromoleculesEditor]);

  const onInitMoleculesEditor = (ketcher: Ketcher) => {
    ketcherRef.current = ketcher;
    setKetcher(ketcher);
    setMoleculesEditor(ketcher.editor);
  };

  const onInitMacromoleculesEditor = (macromoleculesEditor: CoreEditor) => {
    setMacromoleculesEditor(macromoleculesEditor);
  };

  return (
    <>
      <div
        data-ketcher-editor
        className={styles.editorsWrapper}
        style={{
          display: showPolymerEditor ? undefined : 'none',
        }}
      >
        <Suspense
          fallback={
            <div className={styles.switchingLoader}>
              <LoadingCircles />
            </div>
          }
        >
          {ketcherId && (
            <MacromoleculesEditorComponent
              togglerComponent={togglerComponent}
              ketcherId={ketcherId}
              isMacromoleculesEditorTurnedOn={showPolymerEditor}
              monomersLibraryUpdate={props.monomersLibraryUpdate}
              monomersLibraryReplace={props.monomersLibraryReplace}
              onInit={onInitMacromoleculesEditor}
              ui={macromoleculesUI}
            />
          )}
        </Suspense>
      </div>
      <div
        data-ketcher-editor
        className={styles.editorsWrapper}
        style={{
          display: showPolymerEditor ? 'none' : undefined,
        }}
      >
        <MicromoleculesEditorComponent
          {...props}
          ketcherId={ketcherId}
          onSetKetcherId={setKetcherId}
          togglerComponent={togglerComponent}
          onInit={onInitMoleculesEditor}
        />
      </div>
    </>
  );
};
