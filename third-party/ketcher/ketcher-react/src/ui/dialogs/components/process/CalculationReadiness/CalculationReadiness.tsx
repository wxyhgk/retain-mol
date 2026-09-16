/****************************************************************************
 * Copyright 2026 EPAM Systems
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

import { useMemo, useState } from 'react';
import {
  ketcherProvider,
  validateCalculationReadiness,
  type CreateCalculationSnapshotV1Options,
} from 'ketcher-core';
import { Dialog } from '../../../../components';
import type { DialogParams } from '../../../../../components/Dialog/Dialog';
import classes from './CalculationReadiness.module.less';

interface CalculationReadinessProps extends DialogParams {
  ketcherId: string;
}

function parseInteger(value: string): number | null {
  if (value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

function CalculationReadiness({
  ketcherId,
  ...dialogParams
}: CalculationReadinessProps) {
  const ketcher = useMemo(
    () => ketcherProvider.getKetcher(ketcherId),
    [ketcherId],
  );
  const initialSnapshot = useMemo(
    () => ketcher.getCalculationSnapshot(),
    [ketcher],
  );
  const [totalCharge, setTotalCharge] = useState(
    String(initialSnapshot.totalCharge),
  );
  const [multiplicity, setMultiplicity] = useState(
    initialSnapshot.multiplicity === null
      ? ''
      : String(initialSnapshot.multiplicity),
  );

  const chargeValue = parseInteger(totalCharge);
  const multiplicityValue = parseInteger(multiplicity);
  const multiplicityIsBlank = multiplicity.trim() === '';
  const inputError =
    chargeValue === null
      ? 'Total charge must be an integer.'
      : (!multiplicityIsBlank && multiplicityValue === null) ||
        (multiplicityValue !== null && multiplicityValue < 1)
      ? 'Spin multiplicity must be a positive integer.'
      : null;

  const calculation = useMemo(() => {
    if (inputError || chargeValue === null) return null;

    const options: CreateCalculationSnapshotV1Options = {
      totalCharge: chargeValue,
      multiplicity: multiplicityValue,
    };
    const snapshot = ketcher.getCalculationSnapshot(options);
    return {
      snapshot,
      readiness: validateCalculationReadiness(snapshot),
    };
  }, [chargeValue, inputError, ketcher, multiplicityValue]);

  return (
    <Dialog
      title="Calculation Readiness"
      className={classes.dialog}
      withDivider
      buttons={['Cancel', 'Save']}
      buttonsNameMap={{ Save: 'Use for export' }}
      valid={() => calculation !== null}
      result={() => {
        if (chargeValue === null) return null;
        ketcher.setCalculationSettings({
          totalCharge: chargeValue,
          multiplicity: multiplicityValue,
        });
        return {
          totalCharge: chargeValue,
          multiplicity: multiplicityValue,
        };
      }}
      params={dialogParams}
    >
      <p className={classes.intro}>
        Confirm the molecular charge and spin state before exporting a
        calculation geometry.
      </p>
      <div className={classes.inputs}>
        <label>
          <span>Total charge</span>
          <input
            type="number"
            step="1"
            value={totalCharge}
            onChange={(event) => setTotalCharge(event.target.value)}
            data-testid="calculation-total-charge"
          />
        </label>
        <label>
          <span>Spin multiplicity</span>
          <input
            type="number"
            min="1"
            step="1"
            value={multiplicity}
            placeholder="Unspecified"
            onChange={(event) => setMultiplicity(event.target.value)}
            data-testid="calculation-multiplicity"
          />
        </label>
      </div>

      {inputError ? <p className={classes.error}>{inputError}</p> : null}

      {calculation ? (
        <>
          <dl className={classes.summary}>
            <div>
              <dt>Status</dt>
              <dd
                className={
                  calculation.readiness.ready ? classes.ready : classes.error
                }
              >
                {calculation.readiness.ready ? 'Ready' : 'Not ready'}
              </dd>
            </div>
            <div>
              <dt>Atoms</dt>
              <dd>{calculation.snapshot.atoms.length}</dd>
            </div>
            <div>
              <dt>Fragments</dt>
              <dd>{calculation.snapshot.fragments.length}</dd>
            </div>
            <div>
              <dt>Electrons</dt>
              <dd>{calculation.readiness.electronCount ?? 'Unknown'}</dd>
            </div>
          </dl>

          <p className={classes.revision}>
            Frozen snapshot: {calculation.snapshot.revision}
          </p>

          {calculation.readiness.issues.length === 0 ? (
            <p className={classes.ready}>No readiness issues were found.</p>
          ) : (
            <ul className={classes.issues}>
              {calculation.readiness.issues.map((issue) => (
                <li
                  key={`${issue.code}-${issue.atomRefs.join(',')}`}
                  className={
                    issue.severity === 'error'
                      ? classes.issueError
                      : classes.issueWarning
                  }
                >
                  <strong>{issue.severity.toUpperCase()}</strong>
                  <span>{issue.message}</span>
                  {issue.atomRefs.length > 0 ? (
                    <small>{issue.atomRefs.join(', ')}</small>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </>
      ) : null}
    </Dialog>
  );
}

export default CalculationReadiness;
