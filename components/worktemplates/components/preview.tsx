// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useMemo, useState} from 'react';
import {useIntl} from 'react-intl';
import styled from 'styled-components';

import {AccordionItemType} from 'components/common/accordion/accordion';

import {useDispatch, useSelector} from 'react-redux';

import {fetchListing} from 'actions/marketplace';

import {getTemplateDefaultIllustration} from '../utils';

import {Board, Channel, Integration, Playbook, WorkTemplate} from '@mattermost/types/worktemplates';

import {MarketplacePlugin} from '@mattermost/types/marketplace';

import {GlobalState} from '../../../types/store';

import ModalBodyWithIllustration from './modal_body_with_illustration';
import Accordion from './preview/accordion';
import Chip from './preview/chip';
import PreviewSection from './preview/section';

export interface PreviewProps {
    className?: string;
    template: WorkTemplate;
}

const Preview = ({template, ...props}: PreviewProps) => {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();

    const [currentIllustration, setCurrentIllustration] = useState<string>(getTemplateDefaultIllustration(template));
    const plugins: MarketplacePlugin[] = useSelector((state: GlobalState) => state.views.marketplace.plugins);
    const [integrations, setIntegrations] = useState<Integration[]>();
    useEffect(() => {
        dispatch(fetchListing());
    }, [dispatch]);

    const [channels, boards, playbooks, availableIntegrations] = useMemo(() => {
        const channels: Channel[] = [];
        const boards: Board[] = [];
        const playbooks: Playbook[] = [];
        const availableIntegrations: Integration[] = [];
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
                availableIntegrations.push(c.integration);
            }
        });
        return [channels, boards, playbooks, availableIntegrations];
    }, [template.content]);

    useEffect(() => {
        const intg =
            availableIntegrations?.
                flatMap((integration) => {
                    return plugins.reduce((acc: Integration[], curr) => {
                        if (curr.manifest.id === integration.id) {
                            acc.push({
                                ...integration,
                                name: curr.manifest.name,
                                description: curr.manifest.description,
                                icon: curr.icon_data,
                                installed: curr.installed_version !== '',
                            });

                            return acc;
                        }
                        return acc;
                    }, [] as Integration[]);
                }).sort((first: Integration) => {
                    return first.installed ? -1 : 1;
                });
        console.log(intg);
        if (intg?.length) {
            setIntegrations(intg);
        }
    }, [plugins]);

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
                    id={'channels'}
                    message={template.description.channel.message}
                    items={channels}
                    onUpdateIllustration={setCurrentIllustration}
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
                    id={'boards'}
                    message={template.description.board.message}
                    items={boards}
                    onUpdateIllustration={setCurrentIllustration}
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
                    id={'playbooks'}
                    message={template.description.playbook.message}
                    items={playbooks}
                    onUpdateIllustration={setCurrentIllustration}
                />
            )],
        });
    }
    if (integrations?.length) {
        accordionItemsData.push({
            id: 'integrations',
            title: 'Integrations',
            extraContent: <Chip>{integrations.length}</Chip>,
            items: [(
                <PreviewSection
                    key={'integrations'}
                    id={'integrations'}
                    message={template.description.integration.message}
                    items={integrations}
                />
            )],
        });
    }

    // When opening an accordion section, change the illustration to whatever has been open
    const handleItemOpened = (index: number) => {
        const item = accordionItemsData[index];
        switch (item.id) {
        case 'channels':
            setCurrentIllustration(channels[0].illustration);
            break;
        case 'boards':
            setCurrentIllustration(boards[0].illustration);
            break;
        case 'playbooks':
            setCurrentIllustration(playbooks[0].illustration);
            break;
        case 'integrations':
            setCurrentIllustration(template.description.integration.illustration);
        }
    };

    return (
        <div className={props.className}>
            <ModalBodyWithIllustration illustration={currentIllustration || ''}>
                <strong>{formatMessage({
                    id: 'worktemplates.preview.included_in_template_title',
                    defaultMessage: 'Included in template',
                })}</strong>
                <Accordion
                    accordionItemsData={accordionItemsData}
                    openFirstElement={true}
                    onItemOpened={handleItemOpened}
                />
            </ModalBodyWithIllustration>
        </div>
    );
};

const StyledPreview = styled(Preview)`
    display: flex;

    strong {
        display: block;
        font-family: 'Metropolis';
        font-weight: 600;
        font-size: 18px;
        line-height: 24px;
        color: var(--center-channel-text);
        margin-bottom: 8px;
    }
`;

export default StyledPreview;
