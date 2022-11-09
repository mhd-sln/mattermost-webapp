// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useIntl} from 'react-intl';
import styled from 'styled-components';

import {CSSTransition} from 'react-transition-group'; // ES6

import {AccordionItemType} from 'components/common/accordion/accordion';

import {getTemplateDefaultIllustration} from '../utils';

import {Board, Channel, Integration, Playbook, WorkTemplate} from '@mattermost/types/worktemplates';

import Accordion from './preview/accordion';
import Chip from './preview/chip';
import PreviewSection from './preview/section';

export interface PreviewProps {
    className?: string;
    template: WorkTemplate;
}

interface IllustrationAnimations {
    prior: {
        animateIn: boolean;
        illustration: string;
    };
    current: {
        animateIn: boolean;
        illustration: string;
    };
}

const ANIMATE_TIMEOUTS = {
    appear: 0,
    enter: 200,
    exit: 200,
};

const Preview = ({template, ...props}: PreviewProps) => {
    const {formatMessage} = useIntl();
    const nodeRefForPrior = useRef(null);
    const nodeRefForCurrent = useRef(null);

    const [illustrationDetails, setIllustrationDetails] = useState<IllustrationAnimations>(() => {
        const defaultIllustration = getTemplateDefaultIllustration(template);
        return {
            prior: {
                animateIn: false,
                illustration: defaultIllustration,
            },
            current: {
                animateIn: true,
                illustration: defaultIllustration,
            },
        };
    });

    useEffect(() => {
        if (illustrationDetails.prior.animateIn) {
            setIllustrationDetails((prevState: IllustrationAnimations) => ({
                prior: {
                    ...prevState.prior,
                    animateIn: false,
                },
                current: {
                    ...prevState.current,
                    animateIn: true,
                },
            }));
        }
    }, [illustrationDetails.prior.animateIn]);

    const handleIllustrationUpdate = (illustration: string) => setIllustrationDetails({
        prior: {...illustrationDetails.current},
        current: {
            animateIn: false,
            illustration,
        },
    });

    const [channels, boards, playbooks, integrations] = useMemo(() => {
        const channels: Channel[] = [];
        const boards: Board[] = [];
        const playbooks: Playbook[] = [];
        const integrations: Integration[] = [];
        template.content.forEach((c) => {
            if (c.channel) {
                channels.push(c.channel);
            }
            if (c.board) {
                boards.push(c.board);
            }
            if (c.playbook) {
                playbooks.push(c.playbook);
            }
            if (c.integration) {
                integrations.push(c.integration);
            }
        });
        return [channels, boards, playbooks, integrations];
    }, [template.content]);

    // building accordion items
    const accordionItemsData: AccordionItemType[] = [];
    if (channels.length > 0) {
        accordionItemsData.push({
            id: 'channels',
            title: formatMessage({id: 'worktemplates.preview.accordion_title_channels', defaultMessage: 'Channels'}),
            extraContent: <Chip>{channels.length}</Chip>,
            items: [(
                <PreviewSection
                    key={'channels'}
                    message={template.description.channel.message}
                    items={channels}
                    onUpdateIllustration={(illustration) => handleIllustrationUpdate(illustration)}
                />
            )],
        });
    }
    if (boards.length > 0) {
        accordionItemsData.push({
            id: 'boards',
            title: formatMessage({id: 'worktemplates.preview.accordion_title_boards', defaultMessage: 'Boards'}),
            extraContent: <Chip>{boards.length}</Chip>,
            items: [(
                <PreviewSection
                    key={'boards'}
                    message={template.description.board.message}
                    items={boards}
                    onUpdateIllustration={(illustration) => handleIllustrationUpdate(illustration)}
                />
            )],
        });
    }
    if (playbooks.length > 0) {
        accordionItemsData.push({
            id: 'playbooks',
            title: formatMessage({id: 'worktemplates.preview.accordion_title_playbooks', defaultMessage: 'Playbooks'}),
            extraContent: <Chip>{playbooks.length}</Chip>,
            items: [(
                <PreviewSection
                    key={'playbooks'}
                    message={template.description.playbook.message}
                    items={playbooks}
                    onUpdateIllustration={(illustration) => handleIllustrationUpdate(illustration)}
                />
            )],
        });
    }
    if (integrations.length > 0) {
        accordionItemsData.push({
            id: 'integrations',
            title: 'Integrations',
            extraContent: <Chip>{integrations.length}</Chip>,
            items: [<h1 key='integrations'>{'todo: integrations'}</h1>],
        });
    }

    // When opening an accordion section, change the illustration to whatever has been open
    const handleItemOpened = (index: number) => {
        const item = accordionItemsData[index];
        const newPrior = {
            ...illustrationDetails.current,
            animateIn: true,
        };
        const newCurrent: IllustrationAnimations['current'] = {
            animateIn: false,
            illustration: '',
        };
        switch (item.id) {
        case 'channels':
            newCurrent.illustration = channels[0].illustration;
            break;
        case 'boards':
            newCurrent.illustration = boards[0].illustration;
            break;
        case 'playbooks':
            newCurrent.illustration = playbooks[0].illustration;
            break;
        case 'integrations':
            newCurrent.illustration = template.description.integration.illustration;
            break;
        default:
            return;
        }

        if (newCurrent.illustration === newPrior.illustration) {
            return;
        }
        setIllustrationDetails({
            prior: newPrior,
            current: newCurrent,
        });
    };

    return (
        <div className={props.className}>
            <div className='content-side'>
                <strong>{formatMessage({id: 'worktemplates.preview.included_in_template_title', defaultMessage: 'Included in template'})}</strong>
                <Accordion
                    accordionItemsData={accordionItemsData}
                    openFirstElement={true}
                    onItemOpened={handleItemOpened}
                />
            </div>
            <div className='img-wrapper'>
                <CSSTransition
                    nodeRef={nodeRefForPrior}
                    in={illustrationDetails.prior.animateIn}
                    timeout={ANIMATE_TIMEOUTS}
                    classNames='prior-illustration'
                >
                    <img
                        ref={nodeRefForPrior}
                        src={illustrationDetails.prior.illustration}
                    />
                </CSSTransition>
                <CSSTransition
                    nodeRef={nodeRefForCurrent}
                    in={illustrationDetails.current.animateIn}
                    timeout={ANIMATE_TIMEOUTS}
                    classNames='current-illustration'
                >
                    <img
                        ref={nodeRefForCurrent}
                        src={illustrationDetails.current.illustration}
                    />
                </CSSTransition>
            </div>
        </div>
    );
};

const StyledPreview = styled(Preview)`
    display: flex;

    .content-side {
        min-width: 387px;
        height: 416px;
        padding-right: 32px;
    }

    strong {
        display: block;
        font-family: 'Metropolis';
        font-weight: 600;
        font-size: 18px;
        line-height: 24px;
        color: var(--center-channel-text);
        margin-bottom: 8px;
    }

    .img-wrapper {
        position: relative;
        width: 100%;
    }

    img {
        box-shadow: var(--elevation-2);
        border-radius: 8px;
        position: absolute;
    }

    .prior-illustration-enter,
    .prior-illustration-enter-done,
    .prior-illustration-exit-done {
        opacity: 0;
    }

    .prior-illustration-exit {
      opacity: 1;
    }

    .prior-illustration-exit-active {
      opacity: 0;
      transition: opacity 200ms ease-in-out;
    }

    .current-illustration-enter,
    .current-illustration-exit,
    .current-illustration-exit-done {
        opacity: 0;
    }

    .current-illustration-enter-active {
      opacity: 1;
      transition: opacity 200ms ease-in-out;
    }

    .current-illustration-enter-done {
      opacity: 1;
    }
`;

export default StyledPreview;
