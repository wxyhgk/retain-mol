/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AnyAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';
import { changeImage, changeVersion } from '../../../../state/options';

import { Dialog } from '../../../../components';
import SchemaInput from '../../../../primitives/form/SchemaInput/SchemaInput';
import OpenButton from '../../../../primitives/view/openbutton';
import type { FileContent } from '../../../../primitives/view/openButton.types';
import { LoadingCircles } from 'src/ui/components/Spinner';
import classes from './Recognize.module.less';
import { connect } from 'react-redux';
import { load } from '../../../../state';
import { range } from 'lodash/fp';
import { recognize } from '../../../../state/server';
import { DialogActionButton } from 'src/ui/dialogs/components/document/Open/components/DialogActionButton';
import { Icon, StructRender } from 'components';
import {
  CoordinateTransformation,
  Struct,
  createMoleculeEditPlanFromStruct,
  ketcherProvider,
} from 'ketcher-core';
import { useAppContext } from 'src/hooks';

type RecognizedStructureOrPromise = string | Struct | Promise<unknown> | null;
type RecognizeImageFile = File | FileContent | null;

function isImage(file: File | null): boolean {
  return file?.type?.includes('image') ?? false;
}

interface FooterContentProps {
  onImage: (file: RecognizeImageFile) => void;
  structStr: RecognizedStructureOrPromise;
  openHandler: () => void;
  copyHandler: () => void;
  replayHandler: () => void;
  isAddToCanvasDisabled: boolean;
  isReplayDisabled: boolean;
}

function FooterContent({
  onImage,
  structStr,
  openHandler,
  copyHandler,
  replayHandler,
  isAddToCanvasDisabled,
  isReplayDisabled,
}: Readonly<FooterContentProps>) {
  return (
    <div className={classes.footerContent}>
      <OpenButton
        key="choose"
        onLoad={onImage}
        type="image/*"
        className={classes.openButton}
      >
        <Icon name="open" />
        <span>Change image</span>
      </OpenButton>
      <div>
        <DialogActionButton
          key="replayButton"
          disabled={isReplayDisabled}
          clickHandler={replayHandler}
          styles={classes.secondaryButton}
          label="Replay Build"
          title="Build the recognized structure on the current canvas step by step"
        />
        <DialogActionButton
          key="openButton"
          disabled={!structStr}
          clickHandler={openHandler}
          styles={classes.secondaryButton}
          label="Open as new Project"
        />
        <DialogActionButton
          key="copyButton"
          disabled={!structStr || isAddToCanvasDisabled}
          clickHandler={copyHandler}
          styles={classes.primaryButton}
          label="Add to Canvas"
          title="Structure will be loaded as fragment and added to Clipboard"
        />
      </div>
    </div>
  );
}

interface RecognizeDialogProps {
  file: File | null;
  structStr: RecognizedStructureOrPromise;
  fragment: boolean;
  version: string;
  imagoVersions: string[];
  onOk: (result: unknown) => void;
  onCancel: () => void;
  onRecognize: (file: File | null, version: string) => void;
  onImage: (file: RecognizeImageFile) => void;
  onChangeImago: (version: string) => void;
}

function RecognizeDialog(prop: Readonly<RecognizeDialogProps>) {
  const {
    file,
    structStr,
    fragment,
    version,
    imagoVersions,
    onOk,
    ...partProps
  } = prop;
  const { onRecognize, onImage, onChangeImago, ...props } = partProps;
  const [canPreviewImage, setCanPreviewImage] = useState(true);
  const result = () =>
    structStr && !(structStr instanceof Promise)
      ? { structStr, fragment }
      : null;
  const { ketcherId } = useAppContext();
  const ketcher = useMemo(
    () => ketcherProvider.getKetcher(ketcherId),
    [ketcherId],
  );

  useEffect(() => {
    onRecognize(file, version);
  }, [file, version, onRecognize]);

  const clearFile = useCallback(() => {
    onImage(null);
    return true;
  }, [onImage]);

  const copyHandler = () => {
    onOk({ structStr: structStr as string, fragment: true });
  };

  const openHandler = () => {
    onOk({ structStr: structStr as string, fragment: false });
  };

  const replayHandler = () => {
    if (!(structStr instanceof Struct)) return;
    const plan = createMoleculeEditPlanFromStruct(structStr);
    const render = ketcher.editor.render;
    const bounds = render.clientArea.getBoundingClientRect();
    const canvasCenter = CoordinateTransformation.pageToModel(
      {
        clientX: bounds.left + render.clientArea.clientWidth / 2,
        clientY: bounds.top + render.clientArea.clientHeight / 2,
      },
      render,
    );
    const xs = plan.atoms.map(({ x }) => x);
    const ys = plan.atoms.map(({ y }) => y);
    const planCenter = {
      x: (Math.min(...xs) + Math.max(...xs)) / 2,
      y: (Math.min(...ys) + Math.max(...ys)) / 2,
    };
    prop.onCancel();
    window.setTimeout(() => {
      ketcher
        .playMoleculeEditPlan(plan, {
          delayMs: 500,
          positionOffset: {
            x: canvasCenter.x - planCenter.x,
            y: canvasCenter.y - planCenter.y,
          },
        })
        .catch((error: unknown) => {
          const message =
            error instanceof Error ? error.message : 'Unable to replay build';
          ketcher.editor.errorHandler?.(message);
        });
    }, 0);
  };

  return (
    <Dialog
      title="Import Structure from Image"
      className={classes.recognize}
      params={{ ...props, onOk }}
      result={result}
      withDivider={true}
      needMargin={false}
      footerContent={
        <FooterContent
          onImage={onImage}
          openHandler={openHandler}
          structStr={structStr}
          copyHandler={copyHandler}
          replayHandler={replayHandler}
          isAddToCanvasDisabled={
            ketcher.editor.render.options.viewOnlyMode ?? false
          }
          isReplayDisabled={
            !(structStr instanceof Struct) ||
            (ketcher.editor.render.options.viewOnlyMode ?? false)
          }
        />
      }
      buttons={[]}
    >
      <div className={classes.topBody}>
        <label className={classes.imagoVersion}>
          {/* eslint-disable jsx-a11y/label-has-associated-control */}
          Imago version
          <SchemaInput
            type="text"
            schema={{
              enum: imagoVersions,
              enumNames: range(1, imagoVersions.length + 1).map(
                (i) => `Version ${i}`,
              ),
            }}
            value={version}
            onChange={(val) => onChangeImago(val as string)}
          />
          {/* eslint-enable jsx-a11y/label-has-associated-control */}
        </label>
        <span>Original image</span>
        <span>Recognized structure preview</span>
      </div>

      <div className={classes.imagesContainer}>
        <div className={classes.picture}>
          {file && isImage(file) && canPreviewImage && (
            <img
              alt=""
              id="pic"
              src={url(file) ?? ''}
              onError={() => {
                setCanPreviewImage(false);
              }}
            />
          )}
          <span className={classes.filename}> {file ? file.name : null} </span>
          {file && isImage(file) && !canPreviewImage && (
            <div className={classes.messageContainer}>
              <p>
                Preview of '{file.type}' MIME type is not supported by current
                browser
              </p>
            </div>
          )}
          {(!file || (!isImage(file) && clearFile())) && (
            <div className={classes.messageContainer}>
              <p>Please choose image</p>
            </div>
          )}
        </div>
        <div className={classes.output}>
          {structStr &&
            // in Edge 38: instanceof Promise always `false`
            (structStr instanceof Promise ? (
              <div className={classes.messageContainer}>
                <LoadingCircles />
              </div>
            ) : (
              <StructRender className={classes.struct} struct={structStr} />
            ))}
        </div>
      </div>
    </Dialog>
  );
}

type WindowWithWebkitURL = Window & { webkitURL?: typeof globalThis.URL };

function url(file: File | null): string | null {
  if (!file) return null;
  const URL = window.URL || (window as WindowWithWebkitURL).webkitURL;
  return URL ? URL.createObjectURL(file) : 'No preview';
}

interface RecognizeState {
  options: {
    app: {
      imagoVersions: string[];
    };
    recognize: {
      file: File | null;
      structStr: RecognizedStructureOrPromise;
      fragment: boolean;
      version: string | null;
    };
  };
}

const mapStateToProps = (state: RecognizeState) => ({
  imagoVersions: state.options.app.imagoVersions,
  file: state.options.recognize.file,
  structStr: state.options.recognize.structStr,
  fragment: state.options.recognize.fragment,
  version:
    state.options.recognize.version ?? state.options.app.imagoVersions[1],
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<RecognizeState, undefined, AnyAction>,
) => ({
  onImage: (file: RecognizeImageFile) => dispatch(changeImage(file)),
  onRecognize: (file: File | null, ver: string) =>
    dispatch(recognize(file, ver)),
  onChangeImago: (ver: string) => dispatch(changeVersion(ver)),
  onOk: (result: unknown) => {
    const res = result as {
      structStr: string | Struct;
      fragment: boolean;
    };
    dispatch(
      load(res.structStr, {
        rescale: true,
        fragment: res.fragment,
      }),
      // TODO: Removed ownProps.onOk call. consider refactoring of load function in release 2.4
      // See PR #731 (https://github.com/epam/ketcher/pull/731)
    );
  },
});

const Recognize = connect(mapStateToProps, mapDispatchToProps)(RecognizeDialog);

export default Recognize;
